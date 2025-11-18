// mguimaraesn/decola-vagas/Decola-Vagas-refactor-auth-logic/frontend/app/(admin)/admin/layout.tsx

'use client';

import { useAuth } from '../../../context/AuthContext'; // CAMINHO CORRIGIDO
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Toaster } from 'sonner';
import Sidebar, { NavLink } from '../../../components/layout/Sidebar'; // CAMINHO CORRIGIDO
import Header from '../../../components/layout/Header'; // CAMINHO CORRIGIDO
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
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['professor', 'coordenador', 'empresa', 'admin', 'superadmin'] },
  { href: '/admin/users', label: 'Usuários', icon: Users, roles: ['admin', 'superadmin'] },
  { href: '/admin/jobs', label: 'Vagas', icon: Briefcase, roles: ['professor', 'coordenador', 'empresa', 'admin', 'superadmin'] },
  { href: '/admin/institutions', label: 'Instituições', icon: Building, roles: ['superadmin'] },
  { href: '/admin/categories', label: 'Categorias', icon: ClipboardList, roles: ['professor', 'coordenador', 'empresa', 'admin', 'superadmin'] },
  { href: '/admin/areas', label: 'Áreas', icon: Network, roles: ['professor', 'coordenador', 'empresa', 'admin', 'superadmin'] },
  { href: '/admin/roles', label: 'Cargos', icon: Shield, roles: ['superadmin'] },
];

const AdminAuthGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
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

  // --- INÍCIO DA CORREÇÃO DA SIDEBAR ---

  // 1. Descobrir o "cargo de visualização"
  let viewRole: string | undefined;

  // 2. Verificar cargos globais primeiro (que não dependem de instituição ativa)
  const isSuperAdmin = user?.institutions.some(
    (inst: any) => inst.role.name === 'superadmin'
  );
  const isAdmin = user?.institutions.some(
    (inst: any) => inst.role.name === 'admin'
  );

  if (isSuperAdmin) {
    viewRole = 'superadmin';
  } else if (isAdmin) {
    viewRole = 'admin';
  } else {
    // 3. Se não for global admin, usar o cargo da instituição ativa
    // (Isso se aplica a 'professor' ou 'coordenador')
    const activeInstitution = user?.institutions.find(
      (inst) => inst.institution.id === user.activeInstitutionId
    );
    viewRole = activeInstitution?.role.name; // Pode ser 'professor', 'coordenador', ou undefined
  }

  // 4. Filtrar os links com base nesse cargo
  const filteredLinks = allAdminLinks.filter(
    (link) => link.roles?.includes(viewRole || '')
  );
  // --- FIM DA CORREÇÃO DA SIDEBAR ---

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