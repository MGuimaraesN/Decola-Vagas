"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';

export default function NewJobPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [areaId, setAreaId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();
  const router = useRouter();

  // Fetch categories and areas
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [catRes, areaRes] = await Promise.all([
          fetch('http://localhost:5000/categories', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/areas', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const catData = await catRes.json();
        const areaData = await areaRes.json();
        setCategories(catData);
        setAreas(areaData);
      } catch (err) {
        setError('Falha ao carregar dados adicionais.');
      }
    };
    fetchData();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Autenticação necessária.");
      return;
    }

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
          status: 'open' // Status padrão
        }),
      });

      if (res.ok) {
        router.push('/dashboard/jobs');
      } else {
        const data = await res.json();
        setError(data.error || 'Falha ao criar vaga.');
      }
    } catch (err) {
      setError('Erro de rede.');
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Criar Nova Vaga</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700">Título</label>
          <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700">Descrição</label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">Email</label>
          <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        {/* Telephone */}
        <div className="mb-4">
          <label htmlFor="telephone" className="block text-gray-700">Telefone</label>
          <input type="tel" id="telephone" value={telephone} onChange={e => setTelephone(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        {/* Area */}
        <div className="mb-4">
          <label htmlFor="areaId" className="block text-gray-700">Área</label>
          <select id="areaId" value={areaId} onChange={e => setAreaId(e.target.value)} className="w-full p-2 border rounded" required>
            <option value="">Selecione uma área</option>
            {areas.map((area: any) => <option key={area.id} value={area.id}>{area.name}</option>)}
          </select>
        </div>
        {/* Category */}
        <div className="mb-4">
          <label htmlFor="categoryId" className="block text-gray-700">Categoria</label>
          <select id="categoryId" value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-2 border rounded" required>
            <option value="">Selecione uma categoria</option>
            {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Criar Vaga</button>
      </form>
    </div>
  );
}
