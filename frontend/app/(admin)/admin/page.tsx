'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Users, Building, Briefcase } from 'lucide-react';

// Interface para as estatísticas
interface AdminStats {
  userCount: number;
  institutionCount: number;
  jobCount: number;
}

const API_BASE_URL = 'http://localhost:5000';

// Componente de Cartão de Estatística
function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-4">
      <div
        className={`p-3 rounded-full ${colorClass} bg-opacity-10`}
      >
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
        <p className="text-3xl font-bold text-neutral-900">{value}</p>
      </div>
    </div>
  );
}

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
    return (
      <div className="text-neutral-600">Carregando estatísticas...</div>
    );
  }

  if (!stats) {
    return (
      <div className="text-red-500">
        Não foi possível carregar as estatísticas.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">
        Dashboard de Administração
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total de Usuários"
          value={stats.userCount}
          icon={Users}
          colorClass="text-blue-600"
        />
        <StatCard
          title="Total de Instituições"
          value={stats.institutionCount}
          icon={Building}
          colorClass="text-green-600"
        />
        <StatCard
          title="Total de Vagas"
          value={stats.jobCount}
          icon={Briefcase}
          colorClass="text-purple-600"
        />
      </div>
      {/* Aqui você pode adicionar mais seções, como tabelas de dados recentes */}
    </div>
  );
}