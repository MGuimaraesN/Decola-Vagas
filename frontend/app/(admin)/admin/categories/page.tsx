// Salve em: frontend/app/(admin)/admin/categories/page.tsx
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

// Definindo a interface para uma Categoria
interface Category {
  id: number;
  name: string;
}

const API_URL = 'http://localhost:5000/categories';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editCategoryName, setEditCategoryName] = useState('');

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
        setCategories(data);
      } else {
        toast.error('Falha ao buscar categorias.');
      }
    } catch (error) {
      toast.error('Erro de rede ao buscar categorias.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados no mount
  useEffect(() => {
    fetchData();
  }, [token]);

  // Funções do Modal
  const openModal = (category: Category | null = null) => {
    setSelectedCategory(category);
    setEditCategoryName(category ? category.name : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setEditCategoryName('');
  };

  // Funções do AlertDialog
  const openAlertDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsAlertDialogOpen(true);
  };

  const closeAlertDialog = () => {
    setCategoryToDelete(null);
    setIsAlertDialogOpen(false);
  };

  // Funções de CRUD
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = selectedCategory ? `${API_URL}/${selectedCategory.id}` : API_URL;
    const method = selectedCategory ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editCategoryName }),
      });

      if (res.ok) {
        toast.success(`Categoria ${selectedCategory ? 'atualizada' : 'criada'} com sucesso!`);
        closeModal();
        fetchData(); // Re-fetch
      } else {
        const data = await res.json();
        toast.error(data.error || 'Falha ao salvar categoria.');
      }
    } catch (error) {
      toast.error('Erro de rede ao salvar categoria.');
    }
  };

  const handleDelete = async () => {
    if (!token || !categoryToDelete) return;

    try {
      const res = await fetch(`${API_URL}/${categoryToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Categoria excluída com sucesso!');
        closeAlertDialog();
        fetchData(); // Re-fetch
      } else {
        toast.error('Falha ao excluir categoria.');
      }
    } catch (error) {
      toast.error('Erro de rede ao excluir categoria.');
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Categorias</h1>
        <Button onClick={() => openModal()}>Nova Categoria</Button>
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
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openModal(category)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openAlertDialog(category)}>
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
            <DialogTitle>{selectedCategory ? 'Editar' : 'Nova'} Categoria</DialogTitle>
            <DialogDescription>
              Preencha os dados para {selectedCategory ? 'atualizar a' : 'criar uma nova'} categoria.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="py-4">
              <label htmlFor="categoryName" className="block text-sm font-medium mb-1">
                Nome da Categoria
              </label>
              <Input
                id="categoryName"
                type="text"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a categoria "{categoryToDelete?.name}".
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
