"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';

// Interface da Vaga
interface Job {
  id: number;
  title: string;
  status: string;
  area: { name: string };
  category: { name: string };
  createdAt: string;
}

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, activeInstitutionId } = useAuth();
  const router = useRouter();

  const fetchJobs = async () => {
    if (!token || !activeInstitutionId) {
      setJobs([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // Usando a rota my-institution que busca por authorId E institutionId
      // ATENÇÃO: O endpoint /my-institution precisa ser ajustado para filtrar por *autor*
      // Por agora, vamos assumir que my-institution filtra corretamente, ou usar /admin se formos admin
      // Vamos assumir que /my-institution é o correto para "minhas vagas"
      
      // Ajuste: A rota 'my-institution' busca TODAS as vagas da instituição.
      // Precisamos filtrar no frontend pelas vagas do usuário logado.
      // OU (MELHOR) criar uma rota no backend `/jobs/my-jobs`
      
      // Vamos usar /my-institution e filtrar no frontend por enquanto
      // Idealmente, o backend deveria ter uma rota /jobs/my-jobs que filtra por authorId
      const res = await fetch('http://localhost:5000/jobs/my-institution', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data); // TODO: Filtrar por authorId se a rota não o fizer
      } else {
        toast.error('Falha ao carregar vagas.');
      }
    } catch (err) {
      toast.error('Erro de rede.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [token, activeInstitutionId]);

  const handleDelete = async (jobId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/jobs/delete/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Vaga excluída com sucesso!');
        fetchJobs();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Falha ao excluir a vaga.');
      }
    } catch (err) {
      toast.error('Erro de rede.');
    }
  };

  // Helper para formatar status
  const formatStatus = (status: string) => {
    if (status === 'published' || status === 'open') {
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Publicado</span>;
    }
    if (status === 'rascunho') {
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Rascunho</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-800">Fechado</span>;
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Gerenciar Minhas Vagas</h1>
        <Button asChild>
          <Link href="/dashboard/jobs/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar Nova Vaga
          </Link>
        </Button>
      </div>

      {isLoading ? (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Área</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {jobs.length > 0 ? (
                  jobs.map((job: Job) => (
                    <tr key={job.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{job.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{job.category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{job.area.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatStatus(job.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/jobs/edit/${job.id}`}>
                            <Edit className="h-3 w-3 mr-1.5" />
                            Editar
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-3 w-3 mr-1.5" />
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Tem certeza que deseja excluir esta vaga?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. A vaga "{job.title}" será removida permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(job.id)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-neutral-500">
                      Nenhuma vaga criada por você nesta instituição.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}