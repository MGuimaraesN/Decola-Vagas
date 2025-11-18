'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building, LogIn } from 'lucide-react';
import { Toaster, toast } from 'sonner';
// --- IMPORTAÇÕES ADICIONADAS ---
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// --- FIM DAS IMPORTAÇÕES ---

const LOGIN_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, loading } = useAuth();
  const router = useRouter();

  // Redireciona para o dashboard se o usuário já estiver logado

  useEffect(() => {
    document.title = 'Login | Decola Vagas';
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Login realizado com sucesso!');

        // Await login para pegar os dados do usuário
        const userData = await login(data.access_token);

        if (userData) {
          // Lógica de redirecionamento movida para cá
          const isGlobalAdmin = userData.institutions.some(
            (inst: any) => inst.role.name === 'admin' || inst.role.name === 'superadmin'
          );

          if (isGlobalAdmin) {
            router.push('/admin');
            return;
          }

          // Se o usuário não for global admin, verificamos o cargo da instituição ativa
          if (userData.activeInstitutionId) {
            const activeInstitution = userData.institutions.find(
              (inst: any) => inst.institutionId === userData.activeInstitutionId
            );
            const activeRole = activeInstitution?.role.name;

            if (['professor', 'coordenador'].includes(activeRole)) {
              router.push('/admin');
            } else {
              router.push('/dashboard');
            }
          } else {
            // NOVO: Se não houver instituição ativa (primeiro login)
            // Verificamos se ele é professor/coordenador em QUALQUER instituição
            const isProfessorOrCoordenador = userData.institutions.some(
              (inst: any) => ['professor', 'coordenador'].includes(inst.role.name)
            );

            if (isProfessorOrCoordenador) {
              router.push('/admin'); // Redireciona para o admin para escolher a instituição
            } else {
              router.push('/dashboard'); // Caso contrário, vai para o dashboard normal
            }
          }
        } else {
          // Caso o login dê certo mas o fetch de profile falhe
          const profileError = 'Falha ao carregar seu perfil. Tente novamente.';
          setError(profileError);
          toast.error(profileError);
        }

      } else {
        const data = await res.json();
        const errorMessage =
          data.error || 'Falha no login. Verifique seus dados.';
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

  // Não renderiza a página de login se estiver carregando ou se o usuário estiver logado
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
              Acesse as melhores oportunidades da sua instituição.
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
              Entrar na sua conta
            </h1>
            <p className="mb-6 text-center text-neutral-600 lg:text-left">
              Bem-vindo de volta!
            </p>

            {/* --- FORMULÁRIO ATUALIZADO --- */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                />
              </div>

              {/* --- LINK ADICIONADO --- */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              {/* --- FIM DO LINK ADICIONADO --- */}


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
                    'Entrando...'
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      Entrar
                    </>
                  )}
                </Button>
              </div>
            </form>
            {/* --- FIM DO FORMULÁRIO ATUALIZADO --- */}

            <p className="mt-8 text-center text-sm text-neutral-600">
              Não tem uma conta?{' '}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}