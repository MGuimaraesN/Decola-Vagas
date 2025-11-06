'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Caminho de importação corrigido
import { toast } from 'sonner';
import { Users, Building, Briefcase } from 'lucide-react';

// Interface para as estatísticas
interface AdminStats {
  userCount: number;
  institutionCount: number;
  jobCount: number;
}

const API_BASE_URL = 'http://localhost:5000';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          toast.error('Falha ao buscar estatísticas.');
        }
      } catch (error) {
        toast.error('Erro de rede ao buscar estatísticas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (isLoading) {
    return <div>Carregando estatísticas...</div>;
  }

  if (!stats) {
    return <div>Não foi possível carregar as estatísticas.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard de Administração</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de Usuários */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-blue-500 text-white p-4 rounded-full mr-4">
            <Users size={28} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Total de Usuários</h2>
            <p className="text-3xl font-bold text-black">{stats.userCount}</p>
          </div>
        </div>

        {/* Card de Instituições */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-green-500 text-white p-4 rounded-full mr-4">
            <Building size={28} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Total de Instituições</h2>
            <p className="text-3xl font-bold text-black">{stats.institutionCount}</p>
          </div>
        </div>

        {/* Card de Vagas */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-purple-500 text-white p-4 rounded-full mr-4">
            <Briefcase size={28} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Total de Vagas</h2>
            <p className="text-3xl font-bold text-black">{stats.jobCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}