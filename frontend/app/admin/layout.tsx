"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setInstitutions(data.institutions);
          setSelectedInstitution(data.activeInstitutionId);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
        router.push('/login');
      }
    };

    fetchProfile();
  }, [router]);

  const handleInstitutionChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newInstitutionId = event.target.value;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/auth/switch-institution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ institutionId: parseInt(newInstitutionId) })
      });

      if (res.ok) {
        setSelectedInstitution(newInstitutionId);
        window.location.reload(); // Or update state globally
      } else {
        console.error('Failed to switch institution');
      }
    } catch (error) {
      console.error('Failed to switch institution', error);
    }
  };

  return (
    <div>
      <header>
        <h1>Admin Panel</h1>
        <select value={selectedInstitution} onChange={handleInstitutionChange}>
          {institutions.map((inst: any) => (
            <option key={inst.institution.id} value={inst.institution.id}>
              {inst.institution.name}
            </option>
          ))}
        </select>
      </header>
      <main>{children}</main>
    </div>
  );
}
