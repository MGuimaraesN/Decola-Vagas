'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Shield, ArrowLeft, LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // Importando utilitário de classe se disponível, senão use string template

// Definição do tipo para os links
export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
}

interface AdminSidebarProps {
  navLinks: NavLink[];
}

export default function AdminSidebar({ navLinks }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="w-72 flex-shrink-0 bg-slate-950 border-r border-white/10 flex flex-col h-screen sticky top-0 transition-all duration-300">
      
      {/* --- CABEÇALHO --- */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Foxx Admin</h1>
            <p className="text-xs text-neutral-500 font-medium">Gestão do Sistema</p>
          </div>
        </div>

        {/* --- BOTÃO VOLTAR AO MURAL (Estilizado) --- */}
        <Button 
            asChild 
            variant="outline" 
            className="w-full justify-start border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white hover:bg-neutral-800 hover:border-neutral-700 transition-all group"
        >
            <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                Voltar ao Mural
            </Link>
        </Button>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent mx-6 mb-4" />

      {/* --- NAVEGAÇÃO --- */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {/* Indicador lateral para item ativo */}
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />}
              
              <link.icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* --- RODAPÉ (LOGOUT) --- */}
      <div className="p-4 border-t border-white/5 bg-[#09090b]">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 transition-all hover:bg-red-500/10 hover:text-red-400 group border border-transparent hover:border-red-500/20"
        >
          <div className="p-1.5 rounded-md bg-neutral-800 group-hover:bg-red-500/20 transition-colors">
             <LogOut className="h-4 w-4 group-hover:text-red-400" />
          </div>
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}