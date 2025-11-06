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

// Links de navegação do Dashboard
const navLinks: NavLink[] = [
  { href: '/dashboard', label: 'Mural', icon: LayoutDashboard },
  { href: '/dashboard/saved', label: 'Vagas Salvas', icon: Bookmark },
  { href: '/dashboard/jobs', label: 'Minhas Vagas', icon: Briefcase },
  { href: '/dashboard/profile', label: 'Meu Perfil', icon: User },
];

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

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Sidebar Unificada */}
      <Sidebar 
        title="Decola Vagas" 
        icon={Building} 
        navLinks={navLinks} 
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
  );
}