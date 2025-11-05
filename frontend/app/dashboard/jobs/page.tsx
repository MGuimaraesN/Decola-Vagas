"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const { token, activeInstitutionId } = useAuth();
  const router = useRouter();

  const fetchJobs = async () => {
    if (!token || !activeInstitutionId) {
      setJobs([]);
      return;
    }
    try {
      // Usamos a mesma rota do mural, pois ela já filtra pela instituição ativa.
      // Se fosse necessário uma rota para "vagas que eu criei", ela seria usada aqui.
      const res = await fetch('http://localhost:5000/jobs/my-institution', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      } else {
        setError('Falha ao carregar vagas.');
      }
    } catch (err) {
      setError('Erro de rede.');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [token, activeInstitutionId]);

  const handleDelete = async (jobId: number) => {
    if (!token) return;
    if (confirm('Tem certeza que deseja excluir esta vaga?')) {
      try {
        const res = await fetch(`http://localhost:5000/jobs/delete/${jobId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          // Atualiza a lista de vagas após a exclusão
          fetchJobs();
        } else {
          alert('Falha ao excluir a vaga.');
        }
      } catch (err) {
        alert('Erro de rede.');
      }
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciar Minhas Vagas</h1>
        <Link href="/dashboard/jobs/new" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Criar Nova Vaga
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white shadow-md rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">Título</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length > 0 ? (
              jobs.map((job: any) => (
                <tr key={job.id} className="border-b">
                  <td className="px-6 py-4">{job.title}</td>
                  <td className="px-6 py-4">{job.status}</td>
                  <td className="px-6 py-4 text-center">
                    <Link href={`/dashboard/jobs/edit/${job.id}`} className="text-blue-600 hover:underline mr-4">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(job.id)} className="text-red-600 hover:underline">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-4">Nenhuma vaga encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
