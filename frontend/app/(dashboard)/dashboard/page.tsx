"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, CheckCircle, Clock, Loader2, Bookmark } from 'lucide-react';
import { JobDetailModal } from '@/components/JobDetailModal'; // Corrigido o import
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [jobs, setJobs] = useState<Job[]>([]); // Usar a interface Job
  const [isLoading, setIsLoading] = useState(true);
  const { token, activeInstitutionId } = useAuth();

  // --- NOVO: Estado para o Modal ---
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Estado para vagas salvas
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSavedJobs, setIsLoadingSavedJobs] = useState(true);

  // Estados para filtros
  const [filters, setFilters] = useState({ search: '', areaId: '', categoryId: '' });
  const [areas, setAreas] = useState<Area[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // --- FIM NOVO ---

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    recent: 0,
  });

  useEffect(() => {
    // Busca de áreas e categorias (não depende de outros filtros)
    const fetchFilterData = async () => {
        if (!token) return;
        try {
            const [areaRes, catRes] = await Promise.all([
                fetch('http://localhost:5000/areas', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('http://localhost:5000/categories', { headers: { Authorization: `Bearer ${token}` } })
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
    if (!token || !activeInstitutionId) {
      setJobs([]);
      setStats({ total: 0, published: 0, recent: 0 });
      setIsLoading(false);
      return;
    }

    const fetchJobsAndSavedIds = async () => {
      setIsLoading(true);
      // A busca de IDs salvos não precisa ser refetch a cada filtro
      // setIsLoadingSavedJobs(true);

      try {
        const query = new URLSearchParams({
            search: filters.search,
            areaId: filters.areaId,
            categoryId: filters.categoryId,
        }).toString();

        const jobsUrl = `http://localhost:5000/jobs/my-institution?${query}`;

        // A busca de IDs salvos só precisa acontecer uma vez, então a separamos.
        const jobsRes = await fetch(jobsUrl, { headers: { Authorization: `Bearer ${token}` } });

        if (jobsRes.ok) {
          const data: Job[] = await jobsRes.json();
          setJobs(data);

          // Calcular estatísticas
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const totalVagas = data.length;
          const vagasPublicadas = data.filter(
            (job) => job.status === 'published' || job.status === 'open'
          ).length;
          const vagasRecentes = data.filter(
            (job) => new Date(job.createdAt) > sevenDaysAgo
          ).length;

          setStats({
            total: totalVagas,
            published: vagasPublicadas,
            recent: vagasRecentes,
          });
        } else {
          toast.error('Falha ao carregar as vagas.');
        }

        const savedIdsRes = await fetch('http://localhost:5000/saved-jobs/my-saved/ids', { headers: { Authorization: `Bearer ${token}` } });
        if (savedIdsRes.ok) {
            const ids: number[] = await savedIdsRes.json();
            setSavedJobIds(new Set(ids));
        } else {
            toast.error('Falha ao carregar vagas salvas.');
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
            const savedIdsRes = await fetch('http://localhost:5000/saved-jobs/my-saved/ids', { headers: { Authorization: `Bearer ${token}` } });
            if (savedIdsRes.ok) {
                const ids: number[] = await savedIdsRes.json();
                setSavedJobIds(new Set(ids));
            } else {
                toast.error('Falha ao carregar vagas salvas.');
            }
        } catch(err) {
            toast.error('Erro de rede ao buscar vagas salvas.');
        } finally {
            setIsLoadingSavedJobs(false);
        }
    }

    fetchJobsAndSavedIds();
    fetchSavedIds(); // Chamada separada
  }, [token, activeInstitutionId, filters]); // Adicionado filters

    const handleToggleSaveJob = async (jobId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Impede que o modal da vaga abra
    }
    if (isSaving) return;
    setIsSaving(true);

    const isSaved = savedJobIds.has(jobId);
    const url = `http://localhost:5000/saved-jobs/${jobId}`;
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

  // Abre o modal com os detalhes da vaga clicada
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">
        Mural de Vagas
      </h1>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total de Vagas"
          value={isLoading ? '...' : stats.total}
          icon={Briefcase}
          colorClass="text-blue-600"
        />
        <StatCard
          title="Vagas Publicadas"
          value={isLoading ? '...' : stats.published}
          icon={CheckCircle}
          colorClass="text-green-600"
        />
        <StatCard
          title="Novas nos Últimos 7 Dias"
          value={isLoading ? '...' : stats.recent}
          icon={Clock}
          colorClass="text-yellow-600"
        />
      </div>

       {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por título..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          <Select value={filters.areaId} onValueChange={(value) =>
            setFilters(prev => ({ ...prev, areaId: value === 'all' ? '' : value }))}>
              <SelectTrigger><SelectValue placeholder="Filtrar por Área" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Áreas</SelectItem>
                {areas.map(area => <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.categoryId} onValueChange={(value) =>
              setFilters(prev => ({ ...prev, categoryId: value === 'all' ? '' : value }))}>
                <SelectTrigger><SelectValue placeholder="Filtrar por Categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                  </SelectContent>
              </Select>
          {/* O botão pode ser usado no futuro para disparar a busca manualmente */}
          {/* <Button>Buscar</Button> */}
        </div>
      </div>

      {/* Tabela de Vagas Recentes */}
      <h2 className="text-2xl font-bold text-neutral-900 mb-4">
        Vagas da sua instituição
      </h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : jobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Título
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Área
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Categoria
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Data
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                   <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Salvar</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-neutral-50"
                  >
                    <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700 hover:underline cursor-pointer"
                        onClick={() => handleJobClick(job)}
                    >
                      {job.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {job.area.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {job.category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.status === 'published' || job.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {job.status === 'rascunho' ? 'Rascunho' : (job.status === 'published' || job.status === 'open' ? 'Publicado' : 'Fechado')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                            onClick={(e) => handleToggleSaveJob(job.id, e)}
                            disabled={isLoadingSavedJobs || isSaving}
                            className="p-2 rounded-full hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-wait"
                        >
                            <Bookmark
                                className={`h-5 w-5 ${savedJobIds.has(job.id) ? 'text-blue-600 fill-current' : 'text-neutral-400'}`}
                            />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-neutral-500 text-center py-10">
            Nenhuma vaga encontrada para esta instituição.
          </p>
        )}
      </div>

      {/* --- NOVO: Renderiza o Modal --- */}
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