'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
// --- IMPORTAÇÕES ADICIONADAS ---
import * as React from 'react';
import { Building, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'sonner';
// --- FIM DAS IMPORTAÇÕES ---

// --- URL ATUALIZADA ---
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // Pega o token da URL ?token=...

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Redefinir Senha | Decola Vagas';
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      toast.error('As senhas não coincidem.'); // --- ADICIONADO ---
      return;
    }
    if (!token) {
      setError('Token de redefinição não encontrado. Solicite novamente.');
      toast.error('Token de redefinição não encontrado. Solicite novamente.'); // --- ADICIONADO ---
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        toast.success(data.message); // --- ADICIONADO ---
      } else {
        const errorMsg = data.error || 'Ocorreu um erro.';
        setError(errorMsg);
        toast.error(errorMsg); // --- ADICIONADO ---
      }
    } catch (err) {
      const errorMsg = 'Erro de rede. Tente novamente.';
      setError(errorMsg);
      toast.error(errorMsg); // --- ADICIONADO ---
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- LAYOUT ATUALIZADO ---
    <>
      <Toaster richColors />
      <div className="flex min-h-screen w-full bg-neutral-50">
        {/* Lado Esquerdo (Branding) */}
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
              Crie sua nova senha
            </h1>
            <p className="mb-6 text-center text-neutral-600 lg:text-left">
              Quase lá! Digite sua nova senha segura.
            </p>

            {/* Se a redefinição foi bem-sucedida, mostra só a mensagem */}
            {message ? (
              <div className="rounded-md border border-green-200 bg-green-50 p-4">
                <h3 className="font-medium text-green-800">Sucesso!</h3>
                <p className="mt-2 text-sm text-green-700">{message}</p>
                <Button asChild className="mt-4">
                  <Link href="/login">Voltar para o Login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-neutral-700 mb-1"
                  >
                    Nova Senha
                  </label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-neutral-700 mb-1"
                  >
                    Confirmar Nova Senha
                  </label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div>
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    size="lg"
                    disabled={loading || !token}
                  >
                    {loading ? (
                      'Salvando...'
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        Salvar Nova Senha
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
    // --- FIM DO LAYOUT ATUALIZADO ---
  );
}

// O componente que usa 'useSearchParams' precisa estar dentro de um <Suspense>
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <p className="text-neutral-600">Carregando...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}