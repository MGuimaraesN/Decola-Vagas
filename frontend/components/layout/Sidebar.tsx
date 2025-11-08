// NOVO ARQUIVO: frontend/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building, LogOut, type LucideIcon } from 'lucide-react';

// Define o tipo para os links
export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
}

interface SidebarProps {
  title: string;
  icon: LucideIcon;
  navLinks: NavLink[];
}

export default function Sidebar({ title, icon: TitleIcon, navLinks }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-neutral-900 text-white p-4 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-3 py-2 mb-6">
        <TitleIcon className="h-6 w-6 text-blue-400" />
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}