"use client";

import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  User,
  Building,
  Bookmark, 
  FileText // Ícone para Candidaturas
} from 'lucide-react';
import { Toaster } from 'sonner';
import Sidebar, { NavLink } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

// --- MENU ATUALIZADO ---
const allNavLinks: NavLink[] = [
  { href: '/dashboard', label: 'Mural de Vagas', icon: LayoutDashboard, roles: ['student', 'professor', 'coordenador', 'empresa', 'admin', 'superadmin'] },
  { href: '/dashboard/applications', label: 'Minhas Candidaturas', icon: FileText, roles: ['student', 'professor', 'coordenador', 'admin', 'superadmin'] }, // Exclusivo aluno
  { href: '/dashboard/saved', label: 'Vagas Salvas', icon: Bookmark, roles: ['student', 'professor', 'coordenador', 'admin', 'superadmin'] },
  { href: '/dashboard/profile', label: 'Meu Perfil', icon: User, roles: ['student', 'professor', 'coordenador', 'empresa', 'admin', 'superadmin'] },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, loading, getActiveRole } = useAuth(); // Usando getActiveRole
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        Carregando...
      </div>
    );
  }

  // Filtrar links baseado no cargo ativo
  const activeRole = getActiveRole();
  const filteredLinks = allNavLinks.filter(
    (link) => !link.roles || (activeRole && link.roles.includes(activeRole))
  );

  return (
    <div className="flex h-screen w-full bg-white">
      <Sidebar
        title="Decola Vagas"
        icon={Building}
        navLinks={filteredLinks} 
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