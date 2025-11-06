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

// Definindo a interface para uma Instituição
interface Institution {
  id: number;
  name: string;
}

const API_URL = 'http://localhost:5000/institutions';

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [institutionNameToDelete, setInstitutionNameToDelete] = useState<Institution | null>(null);
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
    setInstitutionNameToDelete(institution);
    setIsAlertDialogOpen(true);
  };

  const closeAlertDialog = () => {
    setInstitutionNameToDelete(null);
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
    if (!token || !institutionNameToDelete) return;

    try {
      const res = await fetch(`${API_URL}/${institutionNameToDelete.id}`, {
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
    <div>
      <h1 className="text-2xl font-bold">Gerenciamento de Instituições</h1>
      <button
        onClick={() => openModal()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-4"
      >
        Nova Instituição
      </button>
      <table className="min-w-full bg-white text-black">
        <thead>
          <tr>
            <th className="py-2">Nome</th>
            <th className="py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {institutions.map((institution) => (
            <tr key={institution.id}>
              <td className="border px-4 py-2">{institution.name}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => openModal(institution)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => openAlertDialog(institution)}
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
              {selectedInstitution ? 'Editar' : 'Nova'} Instituição
            </h3>
            <form onSubmit={handleSave}>
              <div className="mt-4">
                <label className="block text-black">Nome da Instituição</label>
                <input
                  type="text"
                  value={editInstitutionName}
                  onChange={(e) => setEditInstitutionName(e.target.value)}
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
              instituição "{institutionNameToDelete?.name}".
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
