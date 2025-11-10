'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import Link from 'next/link';

// Interfaces (ajustadas para o contexto de Vagas)
interface Job {
  id: number;
  title: string;
  status: string;
  institution: { name: string };
  author: { firstName: string; lastName: string };
  createdAt: string;
}

const API_URL = 'http://localhost:5000/admin/jobs';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { token } = useAuth();
  const router = useRouter();

  const fetchData = async () => {
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
        setJobs(data);
      } else {
        toast.error('Falha ao buscar vagas.');
      }
    } catch (error) {
      toast.error('Erro de rede ao buscar vagas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Admin: Vagas | Decola Vagas';
  }, []);

  useEffect(() => {
    fetchData();
  }, [token]);

  const openAlertDialog = (job: Job) => {
    setJobToDelete(job);
    setIsAlertDialogOpen(true);
  };

  const closeAlertDialog = () => {
    setJobToDelete(null);
    setIsAlertDialogOpen(false);
  };

  const handleEdit = (jobId: number) => {
    // ALTERAÇÃO AQUI: Redireciona para a nova página de edição do admin
    router.push(`/admin/jobs/edit/${jobId}`);
  };

  const handleDelete = async () => {
    if (!token || !jobToDelete) return;

    try {
      const res = await fetch(`${API_URL}/${jobToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok || res.status === 204) {
        toast.success('Vaga excluída com sucesso!');
        closeAlertDialog();
        fetchData(); // Re-fetch
      } else {
        toast.error('Falha ao excluir vaga.');
      }
    } catch (error) {
      toast.error('Erro de rede ao excluir vaga.');
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    // Div container removida para preencher o layout
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Todas as Vagas</h1>
        {/* ALTERAÇÃO AQUI: Link aponta para a nova página de criação do admin */}
        <Button asChild>
          <Link href="/admin/jobs/new">Criar Nova Vaga</Link>
        </Button>
      </div>
      {/* Card padronizado em volta da tabela */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Instituição</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.institution.name}</TableCell>
                <TableCell>{`${job.author.firstName} ${job.author.lastName}`}</TableCell>
                <TableCell>
                    <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.status === 'published' || job.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {job.status}
                    </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(job.id)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openAlertDialog(job)}>
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a vaga "{jobToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}