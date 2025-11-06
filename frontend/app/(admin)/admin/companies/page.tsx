// Salve em: frontend/app/(admin)/admin/companies/page.tsx
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
import { Textarea } from '@/components/ui/textarea'; // Usando Textarea para descrição
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

// Definindo a interface para uma Empresa
interface Company {
  id: number;
  name: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  description?: string | null;
}

const API_URL = 'http://localhost:5000/companies';

// Estado inicial para o formulário
const initialFormState = {
  name: '',
  logoUrl: '',
  websiteUrl: '',
  description: '',
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);

  const { token } = useAuth();

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
        setCompanies(data);
      } else {
        toast.error('Falha ao buscar empresas.');
      }
    } catch (error) {
      toast.error('Erro de rede ao buscar empresas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const openModal = (company: Company | null = null) => {
    setSelectedCompany(company);
    setFormData(
      company
        ? {
            name: company.name,
            logoUrl: company.logoUrl || '',
            websiteUrl: company.websiteUrl || '',
            description: company.description || '',
          }
        : initialFormState
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
    setFormData(initialFormState);
  };

  const openAlertDialog = (company: Company) => {
    setCompanyToDelete(company);
    setIsAlertDialogOpen(true);
  };

  const closeAlertDialog = () => {
    setCompanyToDelete(null);
    setIsAlertDialogOpen(false);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = selectedCompany ? `${API_URL}/${selectedCompany.id}` : API_URL;
    const method = selectedCompany ? 'PUT' : 'POST';

    // Garante que campos vazios sejam enviados como null
    const body = {
        ...formData,
        logoUrl: formData.logoUrl || null,
        websiteUrl: formData.websiteUrl || null,
        description: formData.description || null,
    };

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(`Empresa ${selectedCompany ? 'atualizada' : 'criada'} com sucesso!`);
        closeModal();
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Falha ao salvar empresa.');
      }
    } catch (error) {
      toast.error('Erro de rede ao salvar empresa.');
    }
  };

  const handleDelete = async () => {
    if (!token || !companyToDelete) return;

    try {
      const res = await fetch(`${API_URL}/${companyToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Empresa excluída com sucesso!');
        closeAlertDialog();
        fetchData();
      } else {
        toast.error('Falha ao excluir empresa.');
      }
    } catch (error) {
      toast.error('Erro de rede ao excluir empresa.');
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Empresas</h1>
        <Button onClick={() => openModal()}>Nova Empresa</Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Website</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.name}</TableCell>
                <TableCell>
                    <a href={company.websiteUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {company.websiteUrl}
                    </a>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openModal(company)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openAlertDialog(company)}>
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
            <DialogTitle>{selectedCompany ? 'Editar' : 'Nova'} Empresa</DialogTitle>
            <DialogDescription>
              Preencha os dados para {selectedCompany ? 'atualizar a' : 'criar uma nova'} empresa.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nome da Empresa
              </label>
              <Input id="name" type="text" value={formData.name} onChange={handleInputChange} required />
            </div>
             <div>
              <label htmlFor="logoUrl" className="block text-sm font-medium mb-1">
                URL do Logo
              </label>
              <Input id="logoUrl" type="url" value={formData.logoUrl} onChange={handleInputChange} placeholder="https://..." />
            </div>
             <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium mb-1">
                Website
              </label>
              <Input id="websiteUrl" type="url" value={formData.websiteUrl} onChange={handleInputChange} placeholder="https://..." />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Descrição
              </label>
              <Textarea id="description" value={formData.description} onChange={handleInputChange} />
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a empresa "{companyToDelete?.name}".
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
