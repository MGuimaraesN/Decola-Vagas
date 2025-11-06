"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function DashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const { token, activeInstitutionId } = useAuth();

  useEffect(() => {
    if (!token || !activeInstitutionId) {
      // Se não houver instituição ativa, não busca vagas
      setJobs([]);
      return;
    };

    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:5000/jobs/my-institution', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        } else {
          setError('Falha ao carregar as vagas.');
        }
      } catch (err) {
        setError('Erro de rede.');
      }
    };

    fetchJobs();
  }, [token, activeInstitutionId]); // Re-executa quando a instituição ativa muda

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mural de Vagas</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job: any) => (
            <div key={job.id} className="bg-white p-6 rounded shadow-md">
              <h2 className="text-xl font-bold">{job.title}</h2>
              <p className="text-gray-600">{job.description.substring(0, 100)}...</p>
              {/* Adicione mais detalhes da vaga conforme necessário */}
            </div>
          ))
        ) : (
          <p>Nenhuma vaga encontrada para esta instituição.</p>
        )}
      </div>
    </div>
  );
}
