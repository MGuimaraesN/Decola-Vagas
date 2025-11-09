// Salve em: frontend/app/(admin)/admin/institutions/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

// Definindo a interface para uma Instituição
interface Institution {
  id: number;
  name: string;
}

const API_URL = 'http://localhost:5000/institutions';

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [institutionToDelete, setInstitutionToDelete] = useState<Institution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editInstitutionName, setEditInstitutionName] = useState('');

  const { token } = useAuth();

  // Função para buscar os dados
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
        setInstitutions(data);
      } else {
        toast.error('Falha ao buscar instituições.');
      }
    } catch (error) {
      toast.error('Erro de rede ao buscar instituições.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados no mount
  useEffect(() => {
    fetchData();
  }, [token]);

  // Funções do Modal
  const openModal = (institution: Institution | null = null) => {
    setSelectedInstitution(institution);
    setEditInstitutionName(institution ? institution.name : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInstitution(null);
    setEditInstitutionName('');
  };

  // Funções do AlertDialog
  const openAlertDialog = (institution: Institution) => {
    setInstitutionToDelete(institution);
    setIsAlertDialogOpen(true);
  };

  const closeAlertDialog = () => {
    setInstitutionToDelete(null);
    setIsAlertDialogOpen(false);
  };

  // Funções de CRUD
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = selectedInstitution ? `${API_URL}/${selectedInstitution.id}` : API_URL;
    const method = selectedInstitution ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editInstitutionName }),
      });

      if (res.ok) {
        toast.success(`Instituição ${selectedInstitution ? 'atualizada' : 'criada'} com sucesso!`);
        closeModal();
        fetchData(); // Re-fetch
      } else {
        const data = await res.json();
        toast.error(data.error || 'Falha ao salvar instituição.');
      }
    } catch (error) {
      toast.error('Erro de rede ao salvar instituição.');
    }
  };

  const handleDelete = async () => {
    if (!token || !institutionToDelete) return;

    try {
      const res = await fetch(`${API_URL}/${institutionToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Instituição excluída com sucesso!');
        closeAlertDialog();
        fetchData(); // Re-fetch
      } else {
        toast.error('Falha ao excluir instituição.');
      }
    } catch (error) {
      toast.error('Erro de rede ao excluir instituição.');
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    // Div container removida para preencher o layout
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Instituições</h1>
        <Button onClick={() => openModal()}>Nova Instituição</Button>
      </div>
      {/* Card padronizado em volta da tabela */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {institutions.map((institution) => (
              <TableRow key={institution.id}>
                <TableCell>{institution.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openModal(institution)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openAlertDialog(institution)}>
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedInstitution ? 'Editar' : 'Nova'} Instituição</DialogTitle>
            <DialogDescription>
              Preencha os dados para {selectedInstitution ? 'atualizar a' : 'criar uma nova'} instituição.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="py-4">
              <label htmlFor="institutionName" className="block text-sm font-medium mb-1">
                Nome da Instituição
              </label>
              <Input
                id="institutionName"
                type="text"
                value={editInstitutionName}
                onChange={(e) => setEditInstitutionName(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a instituição "{institutionToDelete?.name}".
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