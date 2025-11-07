'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Toaster } from 'sonner';
import Sidebar, { NavLink } from '@/components/layout/Sidebar'; // Importando o Sidebar unificado
import Header from '@/components/layout/Header'; // Importando o Header unificado
import {
  Users,
  Building,
  ClipboardList,
  Network,
  Shield,
  LayoutDashboard,
} from 'lucide-react';

// Links de navegação do Admin
import { Briefcase } from 'lucide-react';

const adminLinks: NavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  { href: '/admin/jobs', label: 'Vagas', icon: Briefcase },
  { href: '/admin/institutions', label: 'Instituições', icon: Building },
  { href: '/admin/companies', label: 'Empresas', icon: Briefcase },
  { href: '/admin/categories', label: 'Categorias', icon: ClipboardList },
  { href: '/admin/areas', label: 'Áreas', icon: Network },
  { href: '/admin/roles', label: 'Cargos', icon: Shield },
];

const AdminAuthGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      const activeInstitution = user.institutions.find(
        (inst) => inst.institution.id === user.activeInstitutionId
      );

      if (
        !activeInstitution ||
        !['admin', 'superadmin'].includes(activeInstitution.role.name)
      ) {
        // Se não for admin, manda para o dashboard normal
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        Carregando...
      </div>
    );
  }

  // Se o usuário é admin, renderiza o layout
  const activeInstitution = user.institutions.find(
    (inst) => inst.institution.id === user.activeInstitutionId
  );
  if (
    activeInstitution &&
    ['admin', 'superadmin'].includes(activeInstitution.role.name)
  ) {
    return <>{children}</>;
  }

  // Fallback caso a lógica de effect não tenha redirecionado a tempo
  return (
    <div className="flex h-screen items-center justify-center bg-neutral-50">
      Redirecionando...
    </div>
  );
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen w-full bg-white">
        {/* Sidebar Unificada */}
        <Sidebar 
          title="Decola Admin" 
          icon={Shield} 
          navLinks={adminLinks} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Unificado */}
          <Header />

          {/* Content */}
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 md:p-10">
            <Toaster richColors />
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}