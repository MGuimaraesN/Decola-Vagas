"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Briefcase, Bookmark, MapPin, Building, Search, 
  Filter, Calendar, ChevronLeft, ChevronRight, Loader2 
} from 'lucide-react';
import { JobDetailModal } from '@/components/JobDetailModal';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// Interfaces
interface Area { id: number; name: string; }
interface Category { id: number; name: string; }
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
interface PaginationMeta { total: number; page: number; lastPage: number; }

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { token, activeInstitutionId, user } = useAuth();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const [filters, setFilters] = useState({ search: '', areaId: '', categoryId: '', page: 1 });
  const [areas, setAreas] = useState<Area[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const isGlobalAdmin = useMemo(() => user?.institutions.some((inst: any) => inst.role.name === 'admin' || inst.role.name === 'superadmin'), [user]);

  useEffect(() => { document.title = 'Mural de Vagas | Decola Vagas'; }, []);

  // Fetch Filtros
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
        } catch (err) { toast.error("Falha ao carregar filtros."); }
    };
    fetchFilterData();
  }, [token]);

  // Fetch Vagas e Salvos
  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    if (!user) { setIsLoading(true); return; }
    if (!isGlobalAdmin && !activeInstitutionId) { setIsLoading(false); setJobs([]); return; }

    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
            search: filters.search,
            areaId: filters.areaId,
            categoryId: filters.categoryId,
            page: filters.page.toString(),
            limit: '9' // Grid 3x3 fica melhor com 9 ou 12
        }).toString();

        const [jobsRes, savedIdsRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/my-institution?${query}`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/saved-jobs/my-saved/ids`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (jobsRes.ok) {
          const json = await jobsRes.json();
          if (json.data) { setJobs(json.data); setMeta(json.meta); } else { setJobs(json); }
        }
        if (savedIdsRes.ok) {
            setSavedJobIds(new Set(await savedIdsRes.json()));
        }
      } catch (err) { toast.error('Erro de rede.'); } 
      finally { setIsLoading(false); }
    };

    fetchJobs();
  }, [token, activeInstitutionId, filters, isGlobalAdmin, user]);

  const handleToggleSaveJob = async (jobId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    const isSaved = savedJobIds.has(jobId);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saved-jobs/${jobId}`, {
            method: isSaved ? 'DELETE' : 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const newSet = new Set(savedJobIds);
            isSaved ? newSet.delete(jobId) : newSet.add(jobId);
            setSavedJobIds(newSet);
            toast.success(isSaved ? 'Removido dos salvos.' : 'Vaga salva!');
        }
    } catch { toast.error('Erro ao salvar.'); } 
    finally { setIsSaving(false); }
  };

  return (
    <div className="container mx-auto pb-20">
      
      {/* Header da Página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Mural de Oportunidades</h1>
        <p className="text-neutral-500 mt-2">Encontre estágios e vagas exclusivas da sua rede.</p>
      </div>

      {/* Barra de Filtros (Estilo Card) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 mb-8 sticky top-20 z-30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input 
                placeholder="Buscar por cargo, empresa..." 
                className="pl-9 bg-neutral-50 border-neutral-200 focus-visible:ring-blue-500"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            />
          </div>
          <div className="md:col-span-3">
            <Select value={filters.areaId} onValueChange={(v) => setFilters(prev => ({ ...prev, areaId: v === 'all' ? '' : v, page: 1 }))}>
              <SelectTrigger className="bg-neutral-50 border-neutral-200"><SelectValue placeholder="Área" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Áreas</SelectItem>
                {areas.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select value={filters.categoryId} onValueChange={(v) => setFilters(prev => ({ ...prev, categoryId: v === 'all' ? '' : v, page: 1 }))}>
              <SelectTrigger className="bg-neutral-50 border-neutral-200"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid de Vagas */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-neutral-100 animate-pulse rounded-xl" />
            ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div 
                key={job.id} 
                onClick={() => setSelectedJob(job)}
                className="group bg-white rounded-xl border border-neutral-200 p-6 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all duration-300 relative flex flex-col justify-between"
            >
                {/* Badge de Status (se não for rascunho, ou se for admin vendo rascunho) */}
                <div className="absolute top-4 right-4">
                    <button 
                        onClick={(e) => handleToggleSaveJob(job.id, e)} 
                        className={`p-2 rounded-full transition-colors ${savedJobIds.has(job.id) ? 'text-blue-600 bg-blue-50' : 'text-neutral-400 hover:bg-neutral-100 hover:text-blue-600'}`}
                    >
                        <Bookmark className={`h-5 w-5 ${savedJobIds.has(job.id) ? 'fill-current' : ''}`} />
                    </button>
                </div>

                <div>
                    <div className="mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 mb-2">
                            {job.category.name}
                        </span>
                        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {job.title}
                        </h3>
                        {/* Se tiver nome da empresa, mostra, senão mostra a instituição */}
                        <div className="flex items-center text-sm text-neutral-500 mt-1">
                            <Building className="h-3.5 w-3.5 mr-1.5" />
                            <span className="truncate">{job.companyName || job.institution.name}</span>
                        </div>
                    </div>

                    <div className="space-y-2 mb-6">
                        <div className="flex items-center text-xs text-neutral-500 bg-neutral-50 p-2 rounded-md">
                            <MapPin className="h-3.5 w-3.5 mr-2 text-neutral-400" />
                            <span className="truncate">{job.area.name}</span>
                        </div>
                        <div className="flex items-center text-xs text-neutral-500 bg-neutral-50 p-2 rounded-md">
                            <Calendar className="h-3.5 w-3.5 mr-2 text-neutral-400" />
                            <span>Publicado em {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
                    <span className="text-xs font-medium text-neutral-400">Ver detalhes</span>
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ChevronRight className="h-4 w-4" />
                    </div>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-neutral-200 border-dashed">
            <div className="bg-neutral-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Nenhuma vaga encontrada</h3>
            <p className="text-neutral-500 mt-1">Tente ajustar os filtros ou busque por outro termo.</p>
            <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setFilters({ search: '', areaId: '', categoryId: '', page: 1 })}
            >
                Limpar Filtros
            </Button>
        </div>
      )}

      {/* Paginação */}
      {meta && meta.lastPage > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
            <Button variant="outline" onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))} disabled={meta.page <= 1} className="w-10 h-10 p-0 rounded-full">
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-neutral-600">
                Página {meta.page} de {meta.lastPage}
            </span>
            <Button variant="outline" onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))} disabled={meta.page >= meta.lastPage} className="w-10 h-10 p-0 rounded-full">
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedJob && (
        <JobDetailModal
            job={selectedJob}
            isOpen={!!selectedJob}
            onClose={() => setSelectedJob(null)}
            isSaved={savedJobIds.has(selectedJob.id)}
            onToggleSave={(id) => handleToggleSaveJob(id)}
            isSaving={isSaving}
        />
      )}
    </div>
  );
}