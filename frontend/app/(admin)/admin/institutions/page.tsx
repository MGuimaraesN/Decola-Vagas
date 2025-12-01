'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { Building, Plus, Search, Pencil, Trash2 } from 'lucide-react';

interface Institution { id: number; name: string; }

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/institutions`;

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filtered, setFiltered] = useState<Institution[]>([]);
  const [search, setSearch] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [institutionToDelete, setInstitutionToDelete] = useState<Institution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');

  const { token } = useAuth();

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}?type=university`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setInstitutions(data);
        setFiltered(data);
      }
    } catch (error) { toast.error('Erro de rede.'); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    document.title = 'Admin: Instituições | Decola Vagas';
    fetchData();
  }, [token]);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(institutions.filter(i => i.name.toLowerCase().includes(lower)));
  }, [search, institutions]);

  const openModal = (inst: Institution | null = null) => {
    setSelectedInstitution(inst);
    setName(inst ? inst.name : '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const url = selectedInstitution ? `${API_URL}/${selectedInstitution.id}` : API_URL;
    const method = selectedInstitution ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        toast.success('Salvo com sucesso!');
        setIsModalOpen(false);
        fetchData();
      } else { toast.error('Erro ao salvar.'); }
    } catch (error) { toast.error('Erro de rede.'); }
  };

  const handleDelete = async () => {
    if (!token || !institutionToDelete) return;
    try {
      const res = await fetch(`${API_URL}/${institutionToDelete.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        toast.success('Excluído!');
        setInstitutionToDelete(null);
        fetchData();
      } else { toast.error('Erro ao excluir (verifique vínculos).'); }
    } catch (error) { toast.error('Erro de rede.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-neutral-900">Instituições</h1>
            <p className="text-neutral-500 text-sm">Gerencie universidades e faculdades.</p>
        </div>
        <Button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Nova Instituição
        </Button>
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-neutral-200 shadow-sm max-w-md">
        <Search className="h-4 w-4 text-neutral-400 ml-2" />
        <Input 
            placeholder="Buscar instituição..." 
            className="border-none shadow-none focus-visible:ring-0 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">ID</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8">Carregando...</TableCell></TableRow>
            ) : filtered.length > 0 ? (
                filtered.map((inst) => (
                <TableRow key={inst.id} className="hover:bg-neutral-50/50">
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                {inst.name[0]}
                            </div>
                            {inst.name}
                        </div>
                    </TableCell>
                    <TableCell className="text-right text-neutral-500 font-mono text-xs">#{inst.id}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openModal(inst)} className="h-8 w-8 text-neutral-500 hover:text-blue-600">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setInstitutionToDelete(inst)} className="h-8 w-8 text-neutral-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-neutral-500">Nenhuma instituição encontrada.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedInstitution ? 'Editar' : 'Nova'} Instituição</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="py-4">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome da Instituição" required />
                <DialogFooter className="mt-4">
                    <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!institutionToDelete} onOpenChange={(o) => !o && setInstitutionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Excluir instituição?</AlertDialogTitle>
                <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}