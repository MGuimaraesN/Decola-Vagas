// NOVO ARQUIVO: frontend/components/layout/Header.tsx
"use client";

import { useAuth } from '@/context/AuthContext';
import InstitutionSwitcher from '@/components/InstitutionSwitcher';
import { User, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { user } = useAuth();

  const activeInstitution = user?.institutions.find(
    (inst) => inst.institution.id === user.activeInstitutionId
  );
  const activeRole = activeInstitution?.role.name;

  const showAdminButton =
    activeRole && ['professor', 'coordenador', 'admin', 'superadmin'].includes(activeRole);

  return (
    <header className="bg-white border-b border-neutral-200 p-4 flex justify-between items-center sticky top-0 z-40">
      {/* Botão Admin (se aplicável) */}
      <div>
        {showAdminButton && (
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              <Shield className="h-4 w-4 mr-2" />
              Painel Admin
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <InstitutionSwitcher />
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-neutral-100 text-neutral-600">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-neutral-700">
            Olá, {user?.firstName}
          </span>
        </div>
      </div>
    </header>
  );
}