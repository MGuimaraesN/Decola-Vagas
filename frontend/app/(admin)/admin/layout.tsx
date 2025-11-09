// mguimaraesn/decola-vagas/Decola-Vagas-refactor-auth-logic/frontend/app/(admin)/admin/layout.tsx

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
  Briefcase, // Importado
} from 'lucide-react';

// Links de navegação do Admin
const allAdminLinks: NavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['professor', 'coordenador', 'admin', 'superadmin'] },
  { href: '/admin/users', label: 'Usuários', icon: Users, roles: ['admin', 'superadmin'] },
  { href: '/admin/jobs', label: 'Vagas', icon: Briefcase, roles: ['admin', 'superadmin'] },
  { href: '/admin/institutions', label: 'Instituições', icon: Building, roles: ['superadmin'] },
  { href: '/admin/categories', label: 'Categorias', icon: ClipboardList, roles: ['professor', 'coordenador', 'admin', 'superadmin'] },
  { href: '/admin/areas', label: 'Áreas', icon: Network, roles: ['professor', 'coordenador', 'admin', 'superadmin'] },
  { href: '/admin/roles', label: 'Cargos', icon: Shield, roles: ['superadmin'] },
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

      // --- INÍCIO DA LÓGICA CORRIGIDA (GUARDIÃO) ---

      // 1. Verificar se o usuário tem permissão global (admin/superadmin)
      // Usamos 'some' para verificar se ele tem esse cargo EM QUALQUER instituição
      const isGlobalAdmin = user.institutions.some(
        (inst: any) => inst.role.name === 'admin' || inst.role.name === 'superadmin'
      );

      if (isGlobalAdmin) {
        return; // Permite acesso
      }

      // 2. Se não for, verificar permissão por instituição ativa
      const activeInstitution = user.institutions.find(
        (inst: any) => inst.institution.id === user.activeInstitutionId
      );
      const activeRole = activeInstitution?.role.name;

      if (
        activeRole &&
        ['professor', 'coordenador'].includes(activeRole)
      ) {
        return; // Permite acesso
      }
      // --- FIM DA LÓGICA CORRIGIDA (GUARDIÃO) ---

      // 3. Se não tiver permissão, redireciona
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        Carregando...
      </div>
    );
  }

  // --- Renderização (também precisa ser corrigida) ---
  const isGlobalAdminCheck = user.institutions.some(
    (inst: any) => inst.role.name === 'admin' || inst.role.name === 'superadmin'
  );

  const activeInstitutionCheck = user.institutions.find(
    (inst: any) => inst.institution.id === user.activeInstitutionId
  );
  const activeRoleCheck = activeInstitutionCheck?.role.name;

  const hasPermission =
    isGlobalAdminCheck ||
    (activeRoleCheck && ['professor', 'coordenador'].includes(activeRoleCheck));

  if (hasPermission) {
    return <>{children}</>;
  }
  // --- Fim da correção de renderização ---

  // Fallback caso a lógica de effect não tenha redirecionado a tempo
  return (
    <div className="flex h-screen items-center justify-center bg-neutral-50">
      Redirecionando...
    </div>
  );
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // --- INÍCIO DA CORREÇÃO DA SIDEBAR VAZIA ---

  // 1. Verificar se o usuário é superadmin (cargo global)
  const isSuperAdmin = user?.institutions.some(
    (inst: any) => inst.role.name === 'superadmin'
  );

  let filteredLinks: NavLink[];

  if (isSuperAdmin) {
    // Superadmin vê TUDO, independente da instituição ativa
    filteredLinks = allAdminLinks;
  } else {
    // Outros cargos (admin, professor) veem links baseados no cargo ATIVO
    const activeInstitution = user?.institutions.find(
      (inst) => inst.institution.id === user.activeInstitutionId
    );
    const activeRole = activeInstitution?.role.name;

    filteredLinks = allAdminLinks.filter(
      (link) => link.roles?.includes(activeRole || '')
    );
  }
  // --- FIM DA CORREÇÃO DA SIDEBAR VAZIA ---

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen w-full bg-white">
        <Sidebar
          title="Decola Admin"
          icon={Shield}
          navLinks={filteredLinks} // Usar links filtrados corretamente
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 md:p-10">
            <Toaster richColors />
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
