// Salve em: frontend/app/(dashboard)/dashboard/saved/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { JobDetailModal } from '@/components/JobDetailModal'; // Supondo que o modal seja reutilizável
import { Briefcase, MapPin, Clock, Building } from 'lucide-react';

// Interfaces (devem ser consistentes com as usadas no projeto)
interface Job {
  id: number;
  title: string;
  description: string;
  status: string;
  area: { name: string };
  category: { name: string };
  company?: { name: string };
  institution: { name: string };
  createdAt: string;
  // --- ADICIONE ESTAS TRÊS LINHAS ---
  email: string;
  telephone: string;
  author: { firstName: string; lastName: string };
  // --- FIM DA ADIÇÃO ---
}

const API_URL = 'http://localhost:5000/saved-jobs/my-saved';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSavedJobs(data);
        } else {
          toast.error('Falha ao buscar vagas salvas.');
        }
      } catch (error) {
        toast.error('Erro de rede ao buscar vagas salvas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedJobs();
  }, [token]);

  // --- ADICIONE ESTA FUNÇÃO ---
  const handleUnsaveJob = async (jobId: number) => {
  if (isSaving || !token) return;
  setIsSaving(true);

  try {
    const res = await fetch(`http://localhost:5000/saved-jobs/${jobId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      toast.success('Vaga removida das salvas!');
      // Remove o job da lista local
      setSavedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      // Fecha o modal
      setSelectedJob(null);
    } else {
      toast.error('Falha ao remover vaga.');
    }
  } catch (error) {
    toast.error('Erro de rede.');
  } finally {
    setIsSaving(false);
  }
  };

  if (isLoading) {
    return <div>Carregando vagas salvas...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-neutral-900">Minhas Vagas Salvas</h1>

      {savedJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Briefcase className="mx-auto h-12 w-12 text-neutral-400" />
            <h2 className="mt-4 text-xl font-semibold text-neutral-800">Nenhuma vaga salva</h2>
            <p className="mt-2 text-neutral-500">
                Você ainda não salvou nenhuma vaga. Comece a explorar e salve as que mais gostar!
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border"
              onClick={() => setSelectedJob(job)}
            >
              <h2 className="text-lg font-bold text-neutral-800 truncate">{job.title}</h2>
              {job.company && (
                  <div className="flex items-center text-sm text-neutral-600 mt-1">
                      <Building size={14} className="mr-2" />
                      {job.company.name}
                  </div>
              )}
              <div className="flex items-center text-sm text-neutral-600 mt-1">
                <MapPin size={14} className="mr-2" />
                {job.institution.name}
              </div>
              <div className="flex items-center text-sm text-neutral-500 mt-2">
                <Briefcase size={14} className="mr-2" />
                {job.area.name} / {job.category.name}
              </div>
              <div className="flex items-center text-sm text-neutral-500 mt-2">
                <Clock size={14} className="mr-2" />
                {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedJob && (
              <JobDetailModal
            job={selectedJob}
        isOpen={!!selectedJob}
            onClose={() => setSelectedJob(null)}
            // --- PROPS ADICIONADAS ---
            isSaved={true}
            onToggleSave={handleUnsaveJob}
            isSaving={isSaving}
            // --- FIM DAS PROPS ADICIONADAS ---
          />
      )}
    </div>
  );
}
