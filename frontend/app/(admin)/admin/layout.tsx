'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Toaster } from 'sonner';
<<<<<<< Updated upstream
// --- ALTERAÇÃO: Importar AdminSidebar e NavLink do arquivo correto ---
=======
>>>>>>> Stashed changes
import AdminSidebar, { NavLink } from './components/AdminSidebar'; 
import Header from '@/components/layout/Header';
import {
  Users,
  Building,
  ClipboardList,
  Network,
  Shield,
  LayoutDashboard,
  Briefcase,
  Building2,
  Inbox
} from 'lucide-react';
<<<<<<< Updated upstream
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
=======
// IMPORTAÇÃO CORRETA
import { Breadcrumbs, BreadcrumbProvider } from '@/components/ui/breadcrumbs';
>>>>>>> Stashed changes

const allAdminLinks: NavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['professor', 'coordenador', 'empresa', 'admin', 'superadmin'] },
  { href: '/admin/users', label: 'Usuários', icon: Users, roles: ['admin', 'superadmin'] },
<<<<<<< Updated upstream
  { href: '/admin/companies', label: 'Empresas', icon: Building2, roles: ['admin', 'superadmin'] }, // Link de Empresas
=======
  { href: '/admin/companies', label: 'Empresas', icon: Building2, roles: ['admin', 'superadmin'] },
>>>>>>> Stashed changes
  { href: '/admin/jobs', label: 'Vagas', icon: Briefcase, roles: ['professor', 'coordenador', 'empresa', 'admin', 'superadmin'] },
  { href: '/admin/applications', label: 'Candidaturas', icon: Inbox, roles: ['professor', 'coordenador', 'empresa', 'admin', 'superadmin'] },
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
<<<<<<< Updated upstream

      // Verificação Global
      const isGlobalAdmin = user.institutions.some(
        (inst: any) => inst.role.name === 'admin' || inst.role.name === 'superadmin'
      );

      if (isGlobalAdmin) return;

      // Verificação por Instituição Ativa
=======
      const isGlobalAdmin = user.institutions.some(
        (inst: any) => inst.role.name === 'admin' || inst.role.name === 'superadmin'
      );
      if (isGlobalAdmin) return;
>>>>>>> Stashed changes
      const activeInstitution = user.institutions.find(
        (inst: any) => inst.institution.id === user.activeInstitutionId
      );
      const activeRole = activeInstitution?.role.name;
<<<<<<< Updated upstream

      if (activeRole && ['professor', 'coordenador', 'empresa'].includes(activeRole)) {
        return;
      }

=======
      if (activeRole && ['professor', 'coordenador', 'empresa'].includes(activeRole)) {
        return;
      }
>>>>>>> Stashed changes
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex h-screen items-center justify-center bg-neutral-50">Carregando...</div>;

<<<<<<< Updated upstream
  // Verificação de renderização para evitar "piscar" conteúdo proibido
  const isGlobalAdminCheck = user.institutions.some(
    (inst: any) => inst.role.name === 'admin' || inst.role.name === 'superadmin'
  );
  const activeInstitutionCheck = user.institutions.find(
    (inst: any) => inst.institution.id === user.activeInstitutionId
  );
=======
  const isGlobalAdminCheck = user.institutions.some((inst: any) => inst.role.name === 'admin' || inst.role.name === 'superadmin');
  const activeInstitutionCheck = user.institutions.find((inst: any) => inst.institution.id === user.activeInstitutionId);
>>>>>>> Stashed changes
  const activeRoleCheck = activeInstitutionCheck?.role.name;
  const hasPermission = isGlobalAdminCheck || (activeRoleCheck && ['professor', 'coordenador', 'empresa'].includes(activeRoleCheck));

<<<<<<< Updated upstream
  const hasPermission = isGlobalAdminCheck || (activeRoleCheck && ['professor', 'coordenador', 'empresa'].includes(activeRoleCheck));

  if (hasPermission) {
    return <>{children}</>;
  }

=======
  if (hasPermission) return <>{children}</>;
>>>>>>> Stashed changes
  return <div className="flex h-screen items-center justify-center bg-neutral-50">Redirecionando...</div>;
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
<<<<<<< Updated upstream

  // Lógica para filtrar links da sidebar baseado no cargo
=======
>>>>>>> Stashed changes
  let viewRole: string | undefined;
  const isSuperAdmin = user?.institutions.some((inst: any) => inst.role.name === 'superadmin');
  const isAdmin = user?.institutions.some((inst: any) => inst.role.name === 'admin');

<<<<<<< Updated upstream
  const isSuperAdmin = user?.institutions.some((inst: any) => inst.role.name === 'superadmin');
  const isAdmin = user?.institutions.some((inst: any) => inst.role.name === 'admin');

  if (isSuperAdmin) {
    viewRole = 'superadmin';
  } else if (isAdmin) {
    viewRole = 'admin';
  } else {
    const activeInstitution = user?.institutions.find(
      (inst) => inst.institution.id === user.activeInstitutionId
    );
    viewRole = activeInstitution?.role.name;
  }

  const filteredLinks = allAdminLinks.filter(
    (link) => link.roles?.includes(viewRole || '')
  );

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen w-full bg-white">
        
        {/* --- AQUI: Usando o AdminSidebar que tem o botão de voltar --- */}
        <AdminSidebar navLinks={filteredLinks} />
        {/* ------------------------------------------------------------- */}

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 md:p-10">
            <Toaster richColors />
            <Breadcrumbs />
            {children}
          </main>
=======
  if (isSuperAdmin) viewRole = 'superadmin';
  else if (isAdmin) viewRole = 'admin';
  else {
    const activeInstitution = user?.institutions.find((inst) => inst.institution.id === user.activeInstitutionId);
    viewRole = activeInstitution?.role.name;
  }

  const filteredLinks = allAdminLinks.filter((link) => link.roles?.includes(viewRole || ''));

  return (
    <AdminAuthGuard>
      {/* O PROVIDER DEVE ESTAR AQUI ENVOLVENDO TUDO */}
      <BreadcrumbProvider>
        <div className="flex min-h-screen w-full bg-white">
          <AdminSidebar navLinks={filteredLinks} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 md:p-10">
              <Toaster richColors />
              <Breadcrumbs />
              {children}
            </main>
          </div>
>>>>>>> Stashed changes
        </div>
      </BreadcrumbProvider>
    </AdminAuthGuard>
  );
}