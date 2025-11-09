"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Define a interface para os dados do usuário
// Define a interface para os dados do usuário
interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  institutions: any[]; // Defina uma interface mais específica se necessário
  activeInstitutionId: number | null;
  role: { name: string };
  // --- ADICIONE ESTAS LINHAS ---
  bio?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  course?: string | null;
  graduationYear?: number | null;
  // --- FIM DA ADIÇÃO ---
}

// Define a interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  activeInstitutionId: number | null;
  login: (token: string) => Promise<User | null>;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  setActiveInstitutionId: (id: number | null) => void;
}

// Cria o contexto com um valor padrão
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook customizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Componente Provedor do Contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeInstitutionId, setActiveInstitutionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    const storedToken = localStorage.getItem('access_token');
    if (!storedToken) {
      logout();
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/auth/profile', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setActiveInstitutionId(userData.activeInstitutionId);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const login = async (newToken: string): Promise<User | null> => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/auth/profile', {
        headers: {
          'Authorization': `Bearer ${newToken}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setActiveInstitutionId(userData.activeInstitutionId);
        return userData;
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user profile after login:', error);
      logout();
    } finally {
      setLoading(false);
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setToken(null);
    setActiveInstitutionId(null);
    router.push('/login');
  };

  const value = {
    user,
    token,
    loading,
    activeInstitutionId,
    login,
    logout,
    fetchUserProfile,
    setActiveInstitutionId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
