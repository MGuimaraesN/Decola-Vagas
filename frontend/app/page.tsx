'use client'; // OBRIGATÓRIO para usar hooks (useState, useEffect)

import { useState, useEffect, FormEvent } from 'react';

// URL do nosso backend separado
const API_URL = 'http://localhost:5000/api/users';

type User = {
  id: number;
  nome: string | null;
  email: string;
  createdAt: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  // 1. Função para buscar (GET) usuários
  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  // 2. Busca os usuários quando a página carrega
  useEffect(() => {
    fetchUsers();
  }, []);

  // 3. Função para criar (POST) um usuário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nome }),
      });

      if (res.ok) {
        setNome('');
        setEmail('');
        fetchUsers(); // Atualiza a lista
      } else {
        alert('Erro ao criar usuário. Email já pode existir.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de rede ao criar usuário.');
    }
  };

  // Tailwind CSS para estilização (remova 'className' se não usar Tailwind)
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        App (Next.js + Express/Prisma)
      </h1>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 p-4 border rounded-lg shadow"
      >
        <h2 className="text-xl font-semibold mb-4">Adicionar Usuário</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome"
            className="input input-bordered w-full p-2 border"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (obrigatório)"
            required
            className="input input-bordered w-full p-2 border"
          />
          <button
            type="submit"
            className="btn btn-primary bg-blue-600 text-white p-2 rounded"
          >
            Salvar
          </button>
        </div>
      </form>

      {/* Lista de Usuários */}
      <div className="shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">
                Nome
              </th>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">
                Email
              </th>
              <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase">
                ID
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="px-5 py-4 text-sm bg-white">
                  {user.nome || 'N/A'}
                </td>
                <td className="px-5 py-4 text-sm bg-white">
                  {user.email}
                </td>
                <td className="px-5 py-4 text-sm bg-white">{user.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}