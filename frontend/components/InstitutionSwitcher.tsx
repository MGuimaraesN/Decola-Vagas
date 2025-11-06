"use client";

import { useAuth } from '../context/AuthContext';
import { ChangeEvent } from 'react';

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

  // Verifica se o usuário e as instituições estão carregados
  if (!user || !user.institutions) {
    return null; // Não renderiza nada se não houver dados
  }

  return (
    <div className="relative">
      <select
        value={activeInstitutionId || ''}
        onChange={handleSwitch}
        className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
      >
        {user.institutions.map((inst: any) => (
          <option key={inst.institutionId} value={inst.institutionId}>
            {inst.institution.name} ({inst.role.name})
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
};

export default InstitutionSwitcher;
