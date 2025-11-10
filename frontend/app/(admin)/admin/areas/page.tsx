// Salve em: frontend/app/(admin)/admin/areas/page.tsx
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

// Definindo a interface para uma Área
interface Area {
  id: number;
  name: string;
}

const API_URL = 'http://localhost:5000/areas';

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editAreaName, setEditAreaName] = useState('');

  const { token } = useAuth();

  // --- INÍCIO DA ADIÇÃO ---
  // Define o título da página quando o componente é montado
  useEffect(() => {
    document.title = 'Admin: Áreas | Decola Vagas';
  }, []);
  // --- FIM DA ADIÇÃO ---

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
        setAreas(data);
      } else {
        toast.error('Falha ao buscar áreas.');
      }
    } catch (error) {
      toast.error('Erro de rede ao buscar áreas.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados no mount
  useEffect(() => {
    fetchData();
  }, [token]);

  // Funções do Modal
  const openModal = (area: Area | null = null) => {
    setSelectedArea(area);
    setEditAreaName(area ? area.name : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArea(null);
    setEditAreaName('');
  };

  // Funções do AlertDialog
  const openAlertDialog = (area: Area) => {
    setAreaToDelete(area);
    setIsAlertDialogOpen(true);
  };

  const closeAlertDialog = () => {
    setAreaToDelete(null);
    setIsAlertDialogOpen(false);
  };

  // Funções de CRUD
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = selectedArea ? `${API_URL}/${selectedArea.id}` : API_URL;
    const method = selectedArea ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editAreaName }),
      });

      if (res.ok) {
        toast.success(`Área ${selectedArea ? 'atualizada' : 'criada'} com sucesso!`);
        closeModal();
        fetchData(); // Re-fetch
      } else {
        const data = await res.json();
        toast.error(data.error || 'Falha ao salvar área.');
      }
    } catch (error) {
      toast.error('Erro de rede ao salvar área.');
    }
  };

  const handleDelete = async () => {
    if (!token || !areaToDelete) return;

    try {
      const res = await fetch(`${API_URL}/${areaToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Área excluída com sucesso!');
        closeAlertDialog();
        fetchData(); // Re-fetch
      } else {
        toast.error('Falha ao excluir área.');
      }
    } catch (error) {
      toast.error('Erro de rede ao excluir área.');
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    // Div container removida para preencher o layout
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Áreas</h1>
        <Button onClick={() => openModal()}>Nova Área</Button>
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
            {areas.map((area) => (
              <TableRow key={area.id}>
                <TableCell>{area.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openModal(area)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openAlertDialog(area)}>
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
            <DialogTitle>{selectedArea ? 'Editar' : 'Nova'} Área</DialogTitle>
            <DialogDescription>
              Preencha os dados para {selectedArea ? 'atualizar a' : 'criar uma nova'} área.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="py-4">
              <label htmlFor="areaName" className="block text-sm font-medium mb-1">
                Nome da Área
              </label>
              <Input
                id="areaName"
                type="text"
                value={editAreaName}
                onChange={(e) => setEditAreaName(e.target.value)}
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a área "{areaToDelete?.name}".
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