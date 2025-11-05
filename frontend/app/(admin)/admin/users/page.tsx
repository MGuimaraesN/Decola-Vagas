'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// Mock data, replace with API calls
const mockUsers = [
  {
    id: 1,
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@decolavagas.com',
    institutions: [
      {
        institution: { id: 1, name: 'Universidade Federal Alpha' },
        role: { id: 1, name: 'superadmin' },
      },
    ],
  },
  {
    id: 2,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@decolavagas.com',
    institutions: [
      {
        institution: { id: 1, name: 'Universidade Federal Alpha' },
        role: { id: 2, name: 'admin' },
      },
    ],
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const { token } = useAuth();

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     const res = await fetch('http://localhost:5000/admin/users', {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const data = await res.json();
  //     setUsers(data);
  //   };
  //   if (token) {
  //     fetchUsers();
  //   }
  // }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
      <table className="min-w-full bg-white">
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold">
              Gerenciar {selectedUser.firstName}
            </h3>
            {/* Implement role management UI here */}
            <button
              onClick={() => setSelectedUser(null)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
