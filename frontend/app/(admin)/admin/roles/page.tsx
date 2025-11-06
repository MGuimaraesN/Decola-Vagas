// Salve em: frontend/app/(admin)/admin/roles/page.tsx
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

// Definindo a interface para um Cargo
interface Role {
  id: number;
  name: string;
}

const API_URL = 'http://localhost:5000/roles';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editRoleName, setEditRoleName] = useState('');

  const { token } = useAuth();

  // Função para buscar os dados
  const fetchData = async () => {
    if (!token) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      } else {
        toast.error('Falha ao buscar cargos.');
      }
    } catch (error) {
      toast.error('Erro de rede ao buscar cargos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados no mount
  useEffect(() => {
    fetchData();
  }, [token]);

  // Funções do Modal
  const openModal = (role: Role | null = null) => {
    setSelectedRole(role);
    setEditRoleName(role ? role.name : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
    setEditRoleName('');
  };

  // Funções do AlertDialog
  const openAlertDialog = (role: Role) => {
    setRoleToDelete(role);
    setIsAlertDialogOpen(true);
  };

  const closeAlertDialog = () => {
    setRoleToDelete(null);
    setIsAlertDialogOpen(false);
  };

  // Funções de CRUD
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = selectedRole ? `${API_URL}/${selectedRole.id}` : API_URL;
    const method = selectedRole ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editRoleName }),
      });

      if (res.ok) {
        toast.success(`Cargo ${selectedRole ? 'atualizado' : 'criado'} com sucesso!`);
        closeModal();
        fetchData(); // Re-fetch
      } else {
        const data = await res.json();
        toast.error(data.error || 'Falha ao salvar cargo.');
      }
    } catch (error) {
      toast.error('Erro de rede ao salvar cargo.');
    }
  };

  const handleDelete = async () => {
    if (!token || !roleToDelete) return;

    try {
      const res = await fetch(`${API_URL}/${roleToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Cargo excluído com sucesso!');
        closeAlertDialog();
        fetchData(); // Re-fetch
      } else {
        toast.error('Falha ao excluir cargo.');
      }
    } catch (error) {
      toast.error('Erro de rede ao excluir cargo.');
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Cargos</h1>
        <Button onClick={() => openModal()}>Novo Cargo</Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openModal(role)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openAlertDialog(role)}>
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
            <DialogTitle>{selectedRole ? 'Editar' : 'Novo'} Cargo</DialogTitle>
            <DialogDescription>
              Preencha os dados para {selectedRole ? 'atualizar o' : 'criar um novo'} cargo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="py-4">
              <label htmlFor="roleName" className="block text-sm font-medium mb-1">
                Nome do Cargo
              </label>
              <Input
                id="roleName"
                type="text"
                value={editRoleName}
                onChange={(e) => setEditRoleName(e.target.value)}
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o cargo "{roleToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
