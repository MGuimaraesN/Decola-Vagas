'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Users, Building, Briefcase, CheckCircle, Edit3, Loader2 } from 'lucide-react'; // Importar novos ícones

// Interface para as estatísticas
interface AdminStats {
  type: 'global';
  userCount: number;
  institutionCount: number;
  jobCount: number;
}

interface PersonalStats {
    type: 'personal';
    totalMyJobs: number;
    publishedMyJobs: number;
    draftMyJobs: number;
}

// Tipo unificado que pode ser um ou outro, ou nulo
type Stats = AdminStats | PersonalStats | null;

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
    // Card padronizado com borda
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-4 border border-neutral-200/60">
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
  const [stats, setStats] = useState<Stats>(null); // Usar o tipo unificado
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    document.title = 'Admin: Dashboard | Decola Vagas';
  }, []);
  
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
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
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
      {/* Título padronizado */}
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        Dashboard
      </h1>

      {/* Renderização condicional com base no 'type' retornado pela API */}
      
      {stats.type === 'global' ? (
        // Estatísticas GLOBAIS (para Admin/Superadmin)
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
      ) : (
        // Estatísticas PESSOAIS (para Professor/Coordenador/Empresa)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Minhas Vagas Criadas"
            value={stats.totalMyJobs}
            icon={Briefcase}
            colorClass="text-blue-600"
          />
          <StatCard
            title="Vagas Publicadas"
            value={stats.publishedMyJobs}
            icon={CheckCircle}
            colorClass="text-green-600"
          />
          <StatCard
            title="Vagas em Rascunho"
            value={stats.draftMyJobs}
            icon={Edit3}
            colorClass="text-yellow-600"
          />
        </div>
      )}
      
      {/* Aqui você pode adicionar mais seções, como tabelas de dados recentes */}
    </div>
  );
}