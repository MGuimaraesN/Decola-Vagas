'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AdminAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      const activeInstitution = user.institutions.find(
        (inst) => inst.institution.id === user.activeInstitutionId
      );

      if (
        !activeInstitution ||
        !['admin', 'superadmin'].includes(activeInstitution.role.name)
      ) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

import AdminSidebar from './components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}
