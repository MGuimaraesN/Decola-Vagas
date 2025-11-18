"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Estado inicial para o formulário de perfil
const initialProfileState = {
  bio: '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  course: '',
  graduationYear: '',
};

export default function ProfilePage() {
  const { user, token, fetchUserProfile } = useAuth(); // Usando fetchUserProfile do contexto

  // State para o formulário de perfil
  const [profileData, setProfileData] = useState(initialProfileState);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // State para o formulário de senha
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Popula o formulário de perfil com os dados do usuário quando o componente é montado

  useEffect(() => {
    document.title = 'Meu Perfil | Decola Vagas';
  }, []);
  
  useEffect(() => {
    if (user) {
      setProfileData({
        bio: user.bio || '',
        linkedinUrl: user.linkedinUrl || '',
        githubUrl: user.githubUrl || '',
        portfolioUrl: user.portfolioUrl || '',
        course: user.course || '',
        graduationYear: user.graduationYear?.toString() || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfileData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [id]: value }));
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Autenticação necessária.');
      return;
    }
    setIsProfileLoading(true);

    const body = {
      ...profileData,
      graduationYear: profileData.graduationYear ? parseInt(profileData.graduationYear, 10) : null,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Perfil atualizado com sucesso!');
        fetchUserProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Falha ao atualizar o perfil.');
      }
    } catch (err) {
      toast.error('Erro de rede ao atualizar o perfil.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As novas senhas não coincidem.');
      return;
    }
    if (!token) {
      toast.error('Autenticação necessária.');
      return;
    }
    setIsPasswordLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Senha alterada com sucesso!');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.error || 'Falha ao alterar a senha.');
      }
    } catch (err) {
      toast.error('Erro de rede ao alterar a senha.');
    } finally {
        setIsPasswordLoading(false);
    }
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Meu Perfil</h1>
        <p className="text-neutral-600 mt-1">Veja e edite suas informações.</p>
      </div>

      {/* Formulário de Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold">Informações Profissionais</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Essas informações ajudam os recrutadores a conhecerem você melhor.
          </p>
        </div>
        <div className="md:col-span-2">
          <form onSubmit={handleProfileSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-6">
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-1">Biografia</label>
              <Textarea id="bio" value={profileData.bio} onChange={handleProfileChange} className="min-h-[120px]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="linkedinUrl" className="block text-sm font-medium text-neutral-700 mb-1">LinkedIn</label>
                <Input type="url" id="linkedinUrl" value={profileData.linkedinUrl} onChange={handleProfileChange} placeholder="https://linkedin.com/in/..."/>
              </div>
              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium text-neutral-700 mb-1">GitHub</label>
                <Input type="url" id="githubUrl" value={profileData.githubUrl} onChange={handleProfileChange} placeholder="https://github.com/..."/>
              </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="portfolioUrl" className="block text-sm font-medium text-neutral-700 mb-1">Portfólio/Site</label>
                <Input type="url" id="portfolioUrl" value={profileData.portfolioUrl} onChange={handleProfileChange} placeholder="https://..."/>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-neutral-700 mb-1">Curso</label>
                <Input type="text" id="course" value={profileData.course} onChange={handleProfileChange} />
              </div>
              <div>
                <label htmlFor="graduationYear" className="block text-sm font-medium text-neutral-700 mb-1">Ano de Formatura</label>
                <Input type="number" id="graduationYear" value={profileData.graduationYear} onChange={handleProfileChange} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isProfileLoading}>
                {isProfileLoading ? 'Salvando...' : 'Salvar Perfil'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Formulário de Senha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
           <h2 className="text-xl font-semibold">Alterar Senha</h2>
           <p className="text-sm text-neutral-500 mt-1">
            Mantenha sua conta segura alterando sua senha regularmente.
          </p>
        </div>
        <div className="md:col-span-2">
            <form onSubmit={handlePasswordSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="oldPassword">Senha Antiga</label>
                        <Input type="password" id="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="newPassword">Nova Senha</label>
                        <Input type="password" id="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="confirmPassword">Confirmar Nova Senha</label>
                        <Input type="password" id="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
                    </div>
                </div>
                 <div className="flex justify-end">
                    <Button type="submit" disabled={isPasswordLoading}>
                        {isPasswordLoading ? 'Salvando...' : 'Alterar Senha'}
                    </Button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
