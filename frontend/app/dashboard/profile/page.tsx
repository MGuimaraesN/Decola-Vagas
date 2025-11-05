"use client";

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As novas senhas não coincidem.' });
      return;
    }

    if (!token) {
      setMessage({ type: 'error', text: 'Autenticação necessária.' });
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Senha alterada com sucesso!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Falha ao alterar a senha.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de rede.' });
    }
  };

  // O layout já exibe um loader se o usuário não estiver carregado.
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meu Perfil</h1>
      <div className="bg-white p-6 rounded shadow-md mb-8">
        <p><strong>Nome:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="oldPassword">Senha Antiga</label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="newPassword">Nova Senha</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="confirmPassword">Confirmar Nova Senha</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {message && (
          <p className={message.type === 'success' ? 'text-green-500' : 'text-red-500'}>
            {message.text}
          </p>
        )}

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Salvar Nova Senha
        </button>
      </form>
    </div>
  );
}
