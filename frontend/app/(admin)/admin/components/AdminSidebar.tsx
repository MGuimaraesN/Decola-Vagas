// Salve em: frontend/app/(admin)/admin/components/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Building,
  ClipboardList,
  Network,
  Shield,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  { href: '/admin/institutions', label: 'Instituições', icon: Building },
  { href: '/admin/categories', label: 'Categorias', icon: ClipboardList },
  { href: '/admin/areas', label: 'Áreas', icon: Network },
  { href: '/admin/roles', label: 'Cargos', icon: Shield },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-neutral-900 text-white p-4 flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 mb-6">
        <Shield className="h-6 w-6 text-blue-400" />
        <h1 className="text-xl font-bold">Decola Admin</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {sidebarLinks.map((link) => {
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