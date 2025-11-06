// NOVO ARQUIVO: frontend/components/layout/Header.tsx
"use client";

import { useAuth } from '@/context/AuthContext';
import InstitutionSwitcher from '@/components/InstitutionSwitcher';
import { User } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-neutral-200 p-4 flex justify-between items-center sticky top-0 z-40">
      {/* Espaçador para alinhar à direita */}
      <div />
      
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