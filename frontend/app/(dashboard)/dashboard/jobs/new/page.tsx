"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Interfaces
interface Category {
  id: number;
  name: string;
}
interface Area {
  id: number;
  name: string;
}

interface Company {
  id: number;
  name: string;
}

export default function NewJobPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [areaId, setAreaId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [companyId, setCompanyId] = useState(''); // Estado para empresa
  const [status, setStatus] = useState('rascunho');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]); // Estado para empresas
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useAuth();
  const router = useRouter();

  // Fetch categories and areas
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [catRes, areaRes, compRes] = await Promise.all([
          fetch('http://localhost:5000/categories', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/areas', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/companies', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (areaRes.ok) setAreas(await areaRes.json());
        if (compRes.ok) setCompanies(await compRes.json());
      } catch (err) {
        toast.error('Falha ao carregar dados adicionais.');
      }
    };
    fetchData();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Autenticação necessária.");
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          email,
          telephone,
          areaId: parseInt(areaId),
          categoryId: parseInt(categoryId),
          companyId: companyId ? parseInt(companyId) : null, // Enviando a empresa
          status: status
        }),
      });

      if (res.ok) {
        toast.success('Vaga criada com sucesso!');
        router.push('/dashboard/jobs');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Falha ao criar vaga.');
      }
    } catch (err) {
      toast.error('Erro de rede.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-neutral-900">Criar Nova Vaga</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm space-y-6">
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">Título da Vaga</label>
          <Input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">Descrição Completa</label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border border-input rounded-md min-h-[150px] text-sm" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email de Contato</label>
            <Input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-neutral-700 mb-1">Telefone de Contato</label>
            <Input type="tel" id="telephone" value={telephone} onChange={e => setTelephone(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="companyId" className="block text-sm font-medium text-neutral-700 mb-1">Empresa (Opcional)</label>
          <Select value={companyId} onValueChange={(value) => setCompanyId(value === 'none' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {companies.map((company) => <SelectItem key={company.id} value={String(company.id)}>{company.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
          <div>
            <label htmlFor="areaId" className="block text-sm font-medium text-neutral-700 mb-1">Área</label>
            <Select value={areaId} onValueChange={setAreaId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-neutral-700 mb-1">Categoria</label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* --- NOVO CAMPO DE STATUS --- */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho (Privado)</SelectItem>
                <SelectItem value="published">Publicado (Público)</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* --- FIM DO NOVO CAMPO --- */}
        </div>

        <div className="flex justify-end gap-4 pt-4">
           <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancelar
           </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Criar Vaga'}
          </Button>
        </div>
      </form>
    </div>
  );
}