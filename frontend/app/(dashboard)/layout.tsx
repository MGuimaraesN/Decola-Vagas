"use client";

import { useEffect, ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InstitutionSwitcher from '../../components/InstitutionSwitcher'; // Importando o componente

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (!storedToken) {
      router.push('/login');
    }
  }, [router]);

  // Mostra um loader enquanto o usuário está sendo carregado
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">Decola Vagas</h1>
        <nav className="flex-1">
          <ul>
            <li className="mb-4">
              <Link href="/dashboard" className="hover:text-blue-300">
                Mural
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/dashboard/jobs" className="hover:text-blue-300">
                Minhas Vagas
              </Link>
            </li>
            <li>
              <Link href="/dashboard/profile" className="hover:text-blue-300">
                Meu Perfil
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-auto">
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <InstitutionSwitcher /> {/* Componente integrado aqui */}
          <div>
            <span>Olá, {user.firstName}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
