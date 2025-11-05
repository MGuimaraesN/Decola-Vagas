
// Salve em: frontend/app/(admin)/admin/components/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarLinks = [
  { href: '/admin/users', label: 'Gerenciar Usuários' },
  { href: '/admin/institutions', label: 'Gerenciar Instituições' },
  { href: '/admin/categories', label: 'Gerenciar Categorias' },
  { href: '/admin/areas', label: 'Gerenciar Áreas' },
  { href: '/admin/roles', label: 'Gerenciar Cargos' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 p-4">
      <nav className="space-y-2">
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-md px-4 py-2 text-sm font-medium ${
              pathname === link.href
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
