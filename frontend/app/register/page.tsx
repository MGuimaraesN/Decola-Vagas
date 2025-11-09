// Salve em: frontend/app/register/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Building, UserPlus } from 'lucide-react';
import { Toaster, toast } from 'sonner';
// --- IMPORTAÇÕES ADICIONADAS ---
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// --- FIM DAS IMPORTAÇÕES ---

const REGISTER_API_URL = 'http://localhost:5000/auth/register';
const INSTITUTIONS_API_URL = 'http://localhost:5000/institutions/public';

interface Institution {
  id: number;
  name: string;
}

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, user, loading } = useAuth();

  // Redireciona para o dashboard se o usuário já estiver logado
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await fetch(INSTITUTIONS_API_URL);
        if (res.ok) {
          const data = await res.json();
          setInstitutions(data);
        }
      } catch (error) {
        console.error('Failed to fetch institutions', error);
        toast.error('Não foi possível carregar as instituições.');
      }
    };
    fetchInstitutions();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(REGISTER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          institutionId: parseInt(institutionId),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.access_token);
        toast.success('Conta criada com sucesso!');
        // O AuthProvider irá redirecionar
      } else {
        const data = await res.json();
        const errorMessage =
          data.error || 'Falha ao cadastrar. Tente novamente.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error(error);
      const networkError = 'Erro de rede. Não foi possível conectar ao servidor.';
      setError(networkError);
      toast.error(networkError);
    } finally {
      setIsLoading(false);
    }
  };

  // Não renderiza a página se estiver carregando ou se o usuário estiver logado
  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <p className="text-neutral-600">Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors />
      <div className="flex min-h-screen w-full bg-neutral-50">
        {/* Lado Esquerdo (Branding) - COM GRADIENTE SUTIL */}
        <div className="hidden min-h-screen w-1/2 flex-col justify-between bg-gradient-to-br from-neutral-900 to-gray-900 p-10 text-white lg:flex">
          <Link href="/" className="flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">Decola Vagas</span>
          </Link>
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              Sua jornada profissional começa aqui.
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Crie sua conta e acesse as melhores oportunidades.
            </p>
          </div>
          <div className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Decola Vagas
          </div>
        </div>

        {/* Lado Direito (Formulário) */}
        <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 flex items-center justify-center gap-2 lg:hidden"
            >
              <Building className="h-7 w-7 text-blue-600" />
              <span className="text-2xl font-bold text-neutral-900">
                Decola Vagas
              </span>
            </Link>

            <h1 className="mb-2 text-center text-3xl font-bold text-neutral-900 lg:text-left">
              Criar sua conta
            </h1>
            <p className="mb-6 text-center text-neutral-600 lg:text-left">
              É rápido e fácil. Vamos começar!
            </p>

            {/* --- FORMULÁRIO ATUALIZADO --- */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-neutral-700 mb-1"
                  >
                    Nome
                  </label>
                  {/* --- SUBSTITUÍDO POR COMPONENT UI --- */}
                  <Input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nome"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-neutral-700 mb-1"
                  >
                    Sobrenome
                  </label>
                  {/* --- SUBSTITUÍDO POR COMPONENT UI --- */}
                  <Input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sobrenome"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Email
                </label>
                {/* --- SUBSTITUÍDO POR COMPONENT UI --- */}
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Senha
                </label>
                {/* --- SUBSTITUÍDO POR COMPONENT UI --- */}
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label
                  htmlFor="institution"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Instituição
                </label>
                {/* --- SUBSTITUÍDO POR COMPONENT UI --- */}
                <Select value={institutionId} onValueChange={setInstitutionId} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione sua instituição" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((institution) => (
                      <SelectItem key={institution.id} value={String(institution.id)}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div>
                {/* --- SUBSTITUÍDO POR COMPONENT UI --- */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isLoading ? (
                    'Criando conta...'
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Criar conta
                    </>
                  )}
                </Button>
              </div>
            </form>
            {/* --- FIM DO FORMULÁRIO ATUALIZADO --- */}

            <p className="mt-8 text-center text-sm text-neutral-600">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:underline"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}