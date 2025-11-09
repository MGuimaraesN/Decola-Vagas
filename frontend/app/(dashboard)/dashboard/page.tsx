"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, CheckCircle, Clock, Loader2, Bookmark, Building, MapPin } from 'lucide-react';
import { JobDetailModal } from '@/components/JobDetailModal';
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
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-4 border border-neutral-200/60">
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

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSavedJobs, setIsLoadingSavedJobs] = useState(true);

  const [filters, setFilters] = useState({ search: '', areaId: '', categoryId: '' });
  const [areas, setAreas] = useState<Area[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    recent: 0,
  });

  useEffect(() => {
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

      try {
        const query = new URLSearchParams({
            search: filters.search,
            areaId: filters.areaId,
            categoryId: filters.categoryId,
        }).toString();

        const jobsUrl = `http://localhost:5000/jobs/my-institution?${query}`;
        const jobsRes = await fetch(jobsUrl, { headers: { Authorization: `Bearer ${token}` } });

        if (jobsRes.ok) {
          const data: Job[] = await jobsRes.json();
          setJobs(data);

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
    fetchSavedIds(); 
  }, [token, activeInstitutionId, filters]);

    const handleToggleSaveJob = async (jobId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); 
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

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  return (
    // --- CLASSE "container mx-auto" REMOVIDA DAQUI ---
    <div>
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
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8 border border-neutral-200/60">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por título..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="md:col-span-2" // Ajustado para 50%
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
        </div>
      </div>

      {/* --- INÍCIO DA SUBSTITUIÇÃO DA TABELA POR CARDS --- */}
      <h2 className="text-2xl font-bold text-neutral-900 mb-4">
        Vagas da sua instituição
      </h2>
      <div className="bg-transparent rounded-lg">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : jobs.length > 0 ? (
          // Grid de Cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.has(job.id)}
                isSaving={isSaving || isLoadingSavedJobs}
                onToggleSave={handleToggleSaveJob}
                onJobClick={handleJobClick}
              />
            ))}
          </div>
        ) : (
          // Mensagem de "Nenhuma vaga" agora em um card
          <div className="bg-white p-10 rounded-lg shadow-sm text-center border border-neutral-200/60">
            <Briefcase className="mx-auto h-12 w-12 text-neutral-400" />
            <p className="text-neutral-600 mt-4 font-medium">
              Nenhuma vaga encontrada para esta instituição ou filtro.
            </p>
          </div>
        )}
      </div>
      {/* --- FIM DA SUBSTITUIÇÃO --- */}

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

// --- NOVO COMPONENTE JOBCARD (ESPECÍFICO PARA O DASHBOARD) ---
interface JobCardProps {
  job: Job;
  isSaved: boolean;
  isSaving: boolean;
  onToggleSave: (jobId: number, e?: React.MouseEvent) => void;
  onJobClick: (job: Job) => void;
}

function JobCard({ job, isSaved, isSaving, onToggleSave, onJobClick }: JobCardProps) {
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `Há ${Math.floor(interval)} anos`;
    interval = seconds / 2592000;
    if (interval > 1) return `Há ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `Há ${Math.floor(interval)} dias`;
    interval = seconds / 3600;
    if (interval > 1) return `Há ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `Há ${Math.floor(interval)} minutos`;
    return `Há ${Math.floor(seconds)} segundos`;
  };

  const statusText = job.status === 'rascunho' 
    ? 'Rascunho' 
    : (job.status === 'published' || job.status === 'open' ? 'Publicado' : 'Fechado');

  const statusColor = job.status === 'published' || job.status === 'open'
    ? 'bg-green-100 text-green-800'
    : 'bg-yellow-100 text-yellow-800';

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-neutral-200/60 hover:shadow-md transition-shadow flex flex-col cursor-pointer"
      onClick={() => onJobClick(job)}
    >
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          {/* Título */}
          <h3 className="text-lg font-bold text-neutral-900 line-clamp-2 pr-2">{job.title}</h3>
          {/* Botão Salvar */}
          <button
              onClick={(e) => onToggleSave(job.id, e)}
              disabled={isSaving}
              className="p-2 rounded-full hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-wait flex-shrink-0"
              aria-label="Salvar vaga"
          >
              <Bookmark
                  className={`h-5 w-5 ${isSaved ? 'text-blue-600 fill-current' : 'text-neutral-400'}`}
              />
          </button>
        </div>
        
        {/* Informações */}
        <div className="flex flex-col gap-2 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium text-blue-600">{job.category.name}</span>
            <span className="text-neutral-300">|</span>
            <span>{job.area.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 flex-shrink-0" />
            <span>{job.institution.name}</span>
          </div>
        </div>

        {/* Descrição */}
        <p className="mt-4 text-sm text-neutral-700 line-clamp-3 flex-1">
          {job.description}
        </p>
      </div>

      {/* Rodapé do Card */}
      <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 mt-4 p-5 border-t border-neutral-100">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>{timeAgo(job.createdAt)}</span>
        </div>
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}