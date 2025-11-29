"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, CheckCircle, Clock, Loader2, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { JobDetailModal } from '@/components/JobDetailModal';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JobRowSkeleton } from '@/components/ui/job-row-skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Definir a interface Job para tipagem
interface Area {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Job {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  email: string;
  telephone: string;
  area: { name: string };
  category: { name: string };
  author: { firstName: string; lastName: string };
  companyName?: string | null;
  institution: { name: string };
}

interface PaginationMeta {
    total: number;
    page: number;
    lastPage: number;
}

// Componente de Cartão de Estatística
function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-4">
      <div
        className={`p-3 rounded-full ${colorClass} bg-opacity-10`}
      >
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
        <p className="text-3xl font-bold text-neutral-900">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { token, activeInstitutionId, user } = useAuth();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSavedJobs, setIsLoadingSavedJobs] = useState(true);

  const [filters, setFilters] = useState({ search: '', areaId: '', categoryId: '', page: 1 });
  const [areas, setAreas] = useState<Area[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const isGlobalAdmin = useMemo(
    () =>
      user?.institutions.some(
        (inst: any) => inst.role.name === 'admin' || inst.role.name === 'superadmin'
      ),
    [user]
  );

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    recent: 0,
  });

  useEffect(() => {
    document.title = 'Mural de Vagas | Decola Vagas';
  }, []);

  useEffect(() => {
    const fetchFilterData = async () => {
        if (!token) return;
        try {
            const [areaRes, catRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/areas`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            if (areaRes.ok) setAreas(await areaRes.json());
            if (catRes.ok) setCategories(await catRes.json());
        } catch (err) {
            toast.error("Falha ao carregar dados para os filtros.");
        }
    };
    fetchFilterData();
  }, [token]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    if (!user) {
        setIsLoading(true);
        return;
    }

    if (!isGlobalAdmin && !activeInstitutionId) {
        setIsLoading(false);
        setJobs([]);
        setStats({ total: 0, published: 0, recent: 0 });
        return;
    }

    const fetchJobsAndSavedIds = async () => {
      setIsLoading(true);
      
      try {
        const query = new URLSearchParams({
            search: filters.search,
            areaId: filters.areaId,
            categoryId: filters.categoryId,
            page: filters.page.toString(),
            limit: '10'
        }).toString();

        const jobsUrl = `${process.env.NEXT_PUBLIC_API_URL}/jobs/my-institution?${query}`;

        const jobsRes = await fetch(jobsUrl, { headers: { Authorization: `Bearer ${token}` } });

        if (jobsRes.ok) {
          const json = await jobsRes.json();
          // Verifica formato
          if (json.data && json.meta) {
              setJobs(json.data);
              setMeta(json.meta);

              setStats(prev => ({ ...prev, total: json.meta.total }));
          } else {
              // Fallback
              setJobs(json);
              setStats(prev => ({ ...prev, total: json.length }));
          }
        } else {
          toast.error('Falha ao carregar as vagas.');
        }

      } catch (err) {
        toast.error('Erro de rede.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSavedIds = async () => {
        if (!token) return;
        setIsLoadingSavedJobs(true);
        try {
            const savedIdsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saved-jobs/my-saved/ids`, { headers: { Authorization: `Bearer ${token}` } });
            if (savedIdsRes.ok) {
                const ids: number[] = await savedIdsRes.json();
                setSavedJobIds(new Set(ids));
            }
        } catch(err) {
            console.error(err);
        } finally {
            setIsLoadingSavedJobs(false);
        }
    }

    fetchJobsAndSavedIds();
    fetchSavedIds();
  }, [token, activeInstitutionId, filters, isGlobalAdmin, user]);

    const handleToggleSaveJob = async (jobId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isSaving) return;
    setIsSaving(true);

    const isSaved = savedJobIds.has(jobId);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/saved-jobs/${jobId}`;
    const method = isSaved ? 'DELETE' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            const newSet = new Set(savedJobIds);
            if (isSaved) {
                newSet.delete(jobId);
                toast.info('Vaga removida dos favoritos.');
            } else {
                newSet.add(jobId);
                toast.success('Vaga salva com sucesso!');
            }
            setSavedJobIds(newSet);
        } else {
            toast.error(`Falha ao ${isSaved ? 'remover' : 'salvar'} vaga.`);
        }
    } catch (error) {
        toast.error('Erro de rede.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  const handlePageChange = (newPage: number) => {
      setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="container mx-auto pb-10">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">
        Mural de Vagas
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total de Vagas"
          value={stats.total}
          icon={Briefcase}
          colorClass="text-blue-600"
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por título..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
          <Select value={filters.areaId} onValueChange={(value) =>
            setFilters(prev => ({ ...prev, areaId: value === 'all' ? '' : value, page: 1 }))}>
              <SelectTrigger><SelectValue placeholder="Filtrar por Área" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Áreas</SelectItem>
                {areas.map(area => <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.categoryId} onValueChange={(value) =>
              setFilters(prev => ({ ...prev, categoryId: value === 'all' ? '' : value, page: 1 }))}>
                <SelectTrigger><SelectValue placeholder="Filtrar por Categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-neutral-900 mb-4">
        {isGlobalAdmin ? "Todas as Vagas" : "Vagas da sua instituição"}
      </h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Título</th>
                  {isGlobalAdmin && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Instituição</th>}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Área</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Categoria</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Salvar</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <JobRowSkeleton key={i} />)
                ) : jobs.length > 0 ? (
                    jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700 hover:underline cursor-pointer" onClick={() => handleJobClick(job)}>
                        {job.title}
                        </td>
                        {isGlobalAdmin && <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{job.institution.name}</td>}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{job.area.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{job.category.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{new Date(job.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.status === 'published' || job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {job.status === 'rascunho' ? 'Rascunho' : (job.status === 'published' || job.status === 'open' ? 'Publicado' : 'Fechado')}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={(e) => handleToggleSaveJob(job.id, e)} disabled={isLoadingSavedJobs || isSaving} className="p-2 rounded-full hover:bg-neutral-100 disabled:opacity-50">
                                <Bookmark className={`h-5 w-5 ${savedJobIds.has(job.id) ? 'text-blue-600 fill-current' : 'text-neutral-400'}`} />
                            </button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={isGlobalAdmin ? 7 : 6} className="px-6 py-4 text-center text-neutral-500">
                            Nenhuma vaga encontrada.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>

          {meta && meta.lastPage > 1 && (
              <div className="flex justify-between items-center mt-4">
                  <Button variant="outline" onClick={() => handlePageChange(meta.page - 1)} disabled={meta.page <= 1}>
                      <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
                  </Button>
                  <span className="text-sm text-neutral-600">Página {meta.page} de {meta.lastPage}</span>
                  <Button variant="outline" onClick={() => handlePageChange(meta.page + 1)} disabled={meta.page >= meta.lastPage}>
                      Próximo <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
              </div>
          )}
      </div>

       {selectedJob && (
        <JobDetailModal
            job={selectedJob}
            isOpen={!!selectedJob}
            onClose={() => setSelectedJob(null)}
            isSaved={savedJobIds.has(selectedJob.id)}
            onToggleSave={(jobId) => handleToggleSaveJob(jobId)}
            isSaving={isSaving || isLoadingSavedJobs}
        />
       )}
    </div>
  );
}
