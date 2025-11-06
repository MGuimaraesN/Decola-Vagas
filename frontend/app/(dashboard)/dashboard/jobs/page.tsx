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

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const { token, activeInstitutionId } = useAuth();
  const router = useRouter();

  const fetchJobs = async () => {
    if (!token || !activeInstitutionId) {
      setJobs([]);
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/jobs/my-institution', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      } else {
        setError('Falha ao carregar vagas.');
      }
    } catch (err) {
      setError('Erro de rede.');
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
        toast.error('Falha ao excluir a vaga.');
      }
    } catch (err) {
      toast.error('Erro de rede.');
    }
  };

  return (
    <div className="container mx-auto">
      <Toaster />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciar Minhas Vagas</h1>
        <Button asChild>
          <Link href="/dashboard/jobs/new">Criar Nova Vaga</Link>
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white shadow-md rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">Título</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length > 0 ? (
              jobs.map((job: any) => (
                <tr key={job.id} className="border-b">
                  <td className="px-6 py-4">{job.title}</td>
                  <td className="px-6 py-4">{job.status}</td>
                  <td className="px-6 py-4 text-center">
                    <Button asChild variant="link">
                      <Link href={`/dashboard/jobs/edit/${job.id}`}>
                        Editar
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Excluir</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Tem certeza que deseja excluir esta vaga?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Essa ação não pode ser desfeita.
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
                <td colSpan={3} className="text-center py-4">Nenhuma vaga encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
