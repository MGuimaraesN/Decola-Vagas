// mguimaraesn/decola-vagas/Decola-Vagas-refactor-auth-logic/frontend/components/layout/Header.tsx
"use client";

import { useAuth } from '@/context/AuthContext';
import InstitutionSwitcher from '@/components/InstitutionSwitcher';
import { User, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname();

  // --- INÍCIO DA CORREÇÃO ---
  let hasAdminAccess = false;
  if (user?.institutions) {
    // 1. Verifica se tem um cargo global (admin/superadmin) em QUALQUER instituição
    const isGlobalAdmin = user.institutions.some(
      (inst: any) => inst.role.name === 'admin' || inst.role.name === 'superadmin'
    );

    if (isGlobalAdmin) {
      hasAdminAccess = true;
    } else {
      // 2. Se não for, verifica o cargo da instituição ATIVA (para professor/coordenador)
      const activeInstitution = user.institutions.find(
        (inst: any) => inst.institution.id === user.activeInstitutionId
      );
      const activeRole = activeInstitution?.role.name;
      if (activeRole && ['professor', 'coordenador'].includes(activeRole)) {
        hasAdminAccess = true;
      }
    }
  }

  const showAdminButton = hasAdminAccess;
  // --- FIM DA CORREÇÃO ---

  // Verifica se a rota atual JÁ É o painel admin
  const isAdminPanel = pathname.startsWith('/admin');

  return (
    <header className="bg-white border-b border-neutral-200 p-4 flex justify-between items-center sticky top-0 z-40">
      {/* Botão Admin (se aplicável e se NÃO estiver no admin) */}
      <div>
        {showAdminButton && !isAdminPanel && (
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