// mguimaraesn/decola-vagas/Decola-Vagas-refactor-auth-logic/frontend/app/(dashboard)/dashboard/layout.tsx
"use client";

import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  User,
  Building,
  Bookmark, // Ícone para Vagas Salvas
} from 'lucide-react';
import { Toaster } from 'sonner';
import Sidebar, { NavLink } from '@/components/layout/Sidebar'; // Importando o Sidebar unificado
import Header from '@/components/layout/Header'; // Importando o Header unificado

// --- INÍCIO DA LÓGICA CORRIGIDA ---
// Links de navegação do Dashboard com 'roles'
const allNavLinks: NavLink[] = [
  { href: '/dashboard', label: 'Mural', icon: LayoutDashboard, roles: ['student', 'professor', 'coordenador', 'admin', 'superadmin', 'empresa'] },
  { href: '/dashboard/saved', label: 'Vagas Salvas', icon: Bookmark, roles: ['student'] }, // Apenas para 'student'
  { href: '/dashboard/jobs', label: 'Minhas Vagas', icon: Briefcase, roles: ['professor', 'coordenador', 'admin', 'superadmin', 'empresa'] }, // Para todos, exceto 'student'
  { href: '/dashboard/profile', label: 'Meu Perfil', icon: User, roles: ['student', 'professor', 'coordenador', 'admin', 'superadmin', 'empresa'] },
];
// --- FIM DA LÓGICA CORRIGIDA ---

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Mostra um loader enquanto o usuário está sendo carregado
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        Carregando...
      </div>
    );
  }

  // --- INÍCIO DA LÓGICA CORRIGIDA ---
  // Obter o cargo ATIVO do usuário para filtrar os links
  const activeInstitution = user.institutions.find(
    (inst: any) => inst.institution.id === user.activeInstitutionId
  );

  // Se não tiver instituição ativa, use o primeiro cargo que encontrar (ex: 'student' ou 'superadmin')
  // Isso é crucial para o superadmin ver os links corretos
  const activeRole = activeInstitution?.role.name || user.institutions[0]?.role.name;

  const filteredLinks = allNavLinks.filter(
    (link) => link.roles?.includes(activeRole || '')
  );
  // --- FIM DA LÓGICA CORRIGIDA ---

  return (
    <div className="flex h-screen w-full bg-white">
      <Sidebar
        title="Decola Vagas"
        icon={Building}
        navLinks={filteredLinks} // Usar os links filtrados
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 md:p-10">
          <Toaster richColors />
          {children}
        </main>
      </div>
    </div>
  );
}
