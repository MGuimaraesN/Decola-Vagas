"use client";

import { useState, FormEvent, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
}
interface Area {
  id: number;
  name: string;
}
interface Institution {
  id: number;
  name: string;
}

export default function AdminEditJobPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [areaId, setAreaId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState('rascunho');
  const [institutionId, setInstitutionId] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { token, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const canEditInstitution = useMemo(() => {
    return user?.institutions.some((inst: any) => 
      ['admin', 'superadmin'].includes(inst.role.name)
    );
  }, [user]);

  useEffect(() => {
    document.title = 'Admin: Editar Vaga | Decola Vagas';
  }, []);

  useEffect(() => {
    if (!token || !id) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const promises = [
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/areas`, { headers: { 'Authorization': `Bearer ${token}` } })
        ];

        if (canEditInstitution) {
            promises.push(fetch(`${process.env.NEXT_PUBLIC_API_URL}/institutions`, { headers: { 'Authorization': `Bearer ${token}` } }));
        }

        const responses = await Promise.all(promises);
        
        const jobRes = responses[0];
        const catRes = responses[1];
        const areaRes = responses[2];

        if (catRes.ok) setCategories(await catRes.json());
        if (areaRes.ok) setAreas(await areaRes.json());
        
        if (canEditInstitution && responses[3] && responses[3].ok) {
            setInstitutions(await responses[3].json());
        }

        if (jobRes.ok) {
          const jobData = await jobRes.json();
          setTitle(jobData.title);
          setDescription(jobData.description);
          setEmail(jobData.email);
          setTelephone(jobData.telephone);
          setAreaId(jobData.areaId.toString());
          setCategoryId(jobData.categoryId.toString());
          setCompanyName(jobData.companyName || '');
          setStatus(jobData.status);
          if (jobData.institutionId) {
              setInstitutionId(jobData.institutionId.toString());
          }
        } else {
          toast.error('Falha ao carregar dados da vaga.');
        }

      } catch (err) {
        toast.error('Falha ao carregar dados da vaga.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, id, canEditInstitution]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Autenticação necessária.");
      return;
    }
    setIsLoading(true);

    try {
      const body: any = {
        title,
        description,
        email,
        telephone,
        areaId: parseInt(areaId),
        categoryId: parseInt(categoryId),
        companyName: companyName,
        status: status
      };

      if (canEditInstitution && institutionId) {
          body.institutionId = parseInt(institutionId);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/edit/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Vaga atualizada com sucesso!');
        router.push('/admin/jobs');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Falha ao atualizar vaga.');
      }
    } catch (err) {
      toast.error('Erro de rede.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Carregando dados da vaga...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-neutral-900">Editar Vaga</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm space-y-6 border border-neutral-200/60">

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">Título da Vaga</label>
          <Input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">Descrição Completa</label>
          <Textarea 
            id="description" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="min-h-[150px]" 
            required 
          />
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

        {/* Grid de 3 colunas para alinhar Status e Instituição lado a lado na segunda linha */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-neutral-700 mb-1">Nome da Empresa (Opcional)</label>
            <Input type="text" id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} />
          </div>

          <div>
            <label htmlFor="areaId" className="block text-sm font-medium text-neutral-700 mb-1">Área</label>
            <Select value={areaId} onValueChange={setAreaId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area: any) => <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>)}
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
                {categories.map((cat: any) => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

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

          {/* Campo de Instituição (Condicional) - MOVIDO PARA CÁ (Ao lado de Status) */}
          {canEditInstitution && (
            <div>
                <label htmlFor="institution" className="block text-sm font-medium text-neutral-700 mb-1">Instituição (Admin)</label>
                <Select value={institutionId} onValueChange={setInstitutionId}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione a instituição" />
                </SelectTrigger>
                <SelectContent>
                    {institutions.map((inst) => (
                    <SelectItem key={inst.id} value={String(inst.id)}>{inst.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
           <Button type="button" variant="outline" onClick={() => router.push('/admin/jobs')} disabled={isLoading}>
            Cancelar
           </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}