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

// Definindo a interface para uma Categoria
interface Category {
  id: number;
  name: string;
}

const API_URL = 'http://localhost:5000/categories';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryNameToDelete, setCategoryNameToDelete] = useState<Category | null>(null);
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
    setCategoryNameToDelete(category);
    setIsAlertDialogOpen(true);
  };

  const closeAlertDialog = () => {
    setCategoryNameToDelete(null);
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
    if (!token || !categoryNameToDelete) return;

    try {
      const res = await fetch(`${API_URL}/${categoryNameToDelete.id}`, {
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
    <div>
      <h1 className="text-2xl font-bold">Gerenciamento de Categorias</h1>
      <button
        onClick={() => openModal()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-4"
      >
        Nova Categoria
      </button>
      <table className="min-w-full bg-white text-black">
        <thead>
          <tr>
            <th className="py-2">Nome</th>
            <th className="py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="border px-4 py-2">{category.name}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => openModal(category)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => openAlertDialog(category)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-black">
              {selectedCategory ? 'Editar' : 'Nova'} Categoria
            </h3>
            <form onSubmit={handleSave}>
              <div className="mt-4">
                <label className="block text-black">Nome da Categoria</label>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full px-3 py-2 text-black border rounded-md"
                  required
                />
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a
              categoria "{categoryNameToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeAlertDialog}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
