"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, CheckCircle, Clock, Loader2 } from 'lucide-react';
import JobDetailModal from '@/components/JobDetailModal'; // Importando o modal
import { toast } from 'sonner';

// Definir a interface Job para tipagem
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  // --- FIM NOVO ---

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    recent: 0,
  });

  useEffect(() => {
    if (!token || !activeInstitutionId) {
      setJobs([]);
      setStats({ total: 0, published: 0, recent: 0 });
      setIsLoading(false);
      return;
    }

    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:5000/jobs/my-institution', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data: Job[] = await res.json();
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
      } catch (err) {
        toast.error('Erro de rede.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [token, activeInstitutionId]);

  // Abre o modal com os detalhes da vaga clicada
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
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

      {/* Tabela de Vagas Recentes */}
      <h2 className="text-2xl font-bold text-neutral-900 mb-4">
        Vagas Recentes (Todas da sua instituição)
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {jobs.map((job) => (
                  <tr 
                    key={job.id} 
                    className="hover:bg-neutral-50 cursor-pointer"
                    onClick={() => handleJobClick(job)} // NOVO: Click handler
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700 hover:underline">
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
      <JobDetailModal 
        job={selectedJob} 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
}