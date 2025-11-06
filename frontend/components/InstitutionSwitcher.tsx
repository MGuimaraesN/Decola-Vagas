"use client";

import { useAuth } from '@/context/AuthContext';
import { ChangeEvent } from 'react';
import { ChevronsUpDown } from 'lucide-react';

const InstitutionSwitcher = () => {
  const { user, activeInstitutionId, login } = useAuth();

  const handleSwitch = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newInstitutionId = parseInt(e.target.value, 10);
    const token = localStorage.getItem('access_token');

    if (!token || isNaN(newInstitutionId)) {
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/auth/switch-institution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ institutionId: newInstitutionId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          login(data.access_token);
        }
      } else {
        console.error('Failed to switch institution');
      }
    } catch (error) {
      console.error('Error switching institution:', error);
    }
  };

  if (!user || !user.institutions) {
    return null;
  }

  return (
    <div className="relative">
      <select
        value={activeInstitutionId || ''}
        onChange={handleSwitch}
        className="block w-full max-w-[200px] appearance-none rounded-md border border-neutral-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-neutral-700 shadow-sm hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {user.institutions.map((inst: any) => (
          <option key={inst.institutionId} value={inst.institutionId}>
            {inst.institution.name} ({inst.role.name})
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <ChevronsUpDown className="h-4 w-4" />
      </div>
    </div>
  );
};

export default InstitutionSwitcher;