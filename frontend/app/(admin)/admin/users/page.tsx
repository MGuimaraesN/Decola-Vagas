// Salve em: frontend/app/(admin)/admin/users/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Interfaces
interface Role {
  id: number;
  name: string;
}

interface Institution {
  id: number;
  name: string;
}

interface UserInstitutionRole {
  userInstitutionRoleId: number;
  institution: Institution;
  role: Role;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  institutions: UserInstitutionRole[];
}

const API_BASE_URL = 'http://localhost:5000';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [assignInstitutionId, setAssignInstitutionId] = useState('');
  const [assignRoleId, setAssignRoleId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { token } = useAuth();

  const fetchData = async () => {
    if (!token) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);

    try {
      // Fetch users, institutions, and roles in parallel
      const [usersRes, institutionsRes, rolesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/institutions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/roles`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      else toast.error('Falha ao buscar usuários.');

      if (institutionsRes.ok) setInstitutions(await institutionsRes.json());
      else toast.error('Falha ao buscar instituições.');

      if (rolesRes.ok) setRoles(await rolesRes.json());
      else toast.error('Falha ao buscar cargos.');

    } catch (error) {
      toast.error('Erro de rede.');
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleAssignRole = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUser || !assignInstitutionId || !assignRoleId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/assign-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          institutionId: parseInt(assignInstitutionId),
          roleId: parseInt(assignRoleId),
        }),
      });

      if (res.ok) {
        toast.success('Cargo atribuído com sucesso!');
        fetchData(); // Refresh all data
        // Reset form
        setAssignInstitutionId('');
        setAssignRoleId('');
        // We need to update the selectedUser state as well to reflect the change immediately in the modal
        const updatedUsers = await (await fetch(`${API_BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })).json();
        const updatedUser = updatedUsers.find((user: User) => user.id === selectedUser.id);
        setSelectedUser(updatedUser);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Falha ao atribuir cargo.');
      }
    } catch (error) {
      toast.error('Erro de rede ao atribuir cargo.');
    }
  };

  const handleRemoveRole = async (userInstitutionRoleId: number) => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/remove-role/${userInstitutionRoleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Cargo removido com sucesso!');
        fetchData(); // Refresh all data
         const updatedUsers = await (await fetch(`${API_BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })).json();
        const updatedUser = updatedUsers.find((user: User) => user.id === selectedUser!.id);
        setSelectedUser(updatedUser);
      } else {
        toast.error('Falha ao remover cargo.');
      }
    } catch (error) {
      toast.error('Erro de rede ao remover cargo.');
    }
  };

    if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
      <table className="min-w-full bg-white text-black mt-4">
        <thead>
          <tr>
            <th className="py-2">Nome</th>
            <th className="py-2">Email</th>
            <th className="py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{`${user.firstName} ${user.lastName}`}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => setSelectedUser(user)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Gerenciar Permissões
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-black">
              Gerenciar Permissões de {selectedUser.firstName}
            </h3>

            <div className="mt-4">
              <h4 className="font-semibold text-black">Cargos Atuais</h4>
              <ul className="list-disc pl-5 text-black">
                {selectedUser.institutions.map((instRole) => (
                  <li key={instRole.userInstitutionRoleId} className="mt-2">
                    {instRole.institution.name} - <strong>{instRole.role.name}</strong>
                    <button
                      onClick={() => handleRemoveRole(instRole.userInstitutionRoleId)}
                      className="ml-4 bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="my-4" />

            <h4 className="font-semibold text-black">Atribuir Novo Cargo</h4>
            <form onSubmit={handleAssignRole}>
              <div className="mt-2">
                <label className="block text-black">Instituição</label>
                <select
                  value={assignInstitutionId}
                  onChange={(e) => setAssignInstitutionId(e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  required
                >
                  <option value="" disabled>Selecione</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2">
                <label className="block text-black">Cargo</label>
                <select
                  value={assignRoleId}
                  onChange={(e) => setAssignRoleId(e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  required
                >
                  <option value="" disabled>Selecione</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Atribuir
                </button>
              </div>
            </form>

            <button
              onClick={() => setSelectedUser(null)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-6"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
