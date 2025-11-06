"use client";

import Link from 'next/link';
import { Building, Briefcase, Users, Network, LogIn, Clock, MapPin, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Interfaces para os dados
interface Job {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  area: { name: string };
  category: { name: string };
  institution: { name: string };
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Redireciona para o dashboard se o usuário já estiver logado
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // --- NOVA FUNCIONALIDADE: Buscar vagas públicas ---
  useEffect(() => {
    const fetchPublicJobs = async () => {
      setLoadingJobs(true);
      try {
        const res = await fetch('http://localhost:5000/jobs/public');
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (error) {
        console.error("Erro ao buscar vagas públicas:", error);
      } finally {
        setLoadingJobs(false);
      }
    };
    // Só busca as vagas se não estiver logado e o auth não estiver carregando
    if (!user && !loading) {
      fetchPublicJobs();
    }
  }, [user, loading]);
  // --- FIM DA NOVA FUNCIONALIDADE ---


  // Não renderiza a página de login se estiver carregando ou se o usuário estiver logado
  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <p className="text-neutral-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-neutral-900">
              Decola Vagas
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4" />
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center md:py-32">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
            Encontre sua próxima oportunidade acadêmica.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-neutral-600">
            O Decola Vagas centraliza estágios, iniciações científicas e vagas
            juniores diretamente da sua instituição de ensino.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              href="/register"
              className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Começar agora
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-100"
            >
              Fazer Login
            </Link>
          </div>
        </section>

        {/* --- NOVA SEÇÃO: Vagas Recentes --- */}
        <section className="bg-white py-20 md:py-24">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="text-center text-3xl font-bold text-neutral-900 mb-12">
              Vagas Recentes
            </h2>
            {loadingJobs ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.slice(0, 6).map((job) => ( // Limita a 6 vagas
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <p className="text-center text-neutral-500">
                Nenhuma vaga publicada no momento.
              </p>
            )}
            <div className="text-center mt-12">
              <Link
                href="/register"
                className="text-lg font-semibold text-blue-600 hover:underline"
              >
                Crie sua conta para ver todas as vagas &rarr;
              </Link>
            </div>
          </div>
        </section>
        {/* --- FIM DA NOVA SEÇÃO --- */}


        {/* Features Section */}
        <section className="bg-neutral-50 py-20 md:py-24 border-t border-neutral-200">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="text-center text-3xl font-bold text-neutral-900">
              Tudo em um só lugar
            </h2>
            <p className="mt-4 text-center text-lg text-neutral-600">
              Chega de vagas perdidas em e-mails ou murais físicos.
            </p>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              <FeatureCard
                icon={Briefcase}
                title="Vagas Centralizadas"
                description="Professores e coordenadores postam as vagas, e você encontra tudo aqui."
              />
              <FeatureCard
                icon={Users}
                title="Conexão Direta"
                description="Acesse oportunidades exclusivas da sua instituição de ensino."
              />
              <FeatureCard
                icon={Network}
                title="Filtros Inteligentes"
                description="Encontre rapidamente vagas por área, categoria ou status."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400">
        <div className="container mx-auto flex items-center justify-between px-4 py-6 md:px-6">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Decola Vagas. Todos os direitos
            reservados.
          </p>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            <span className="text-md font-medium text-white">Decola Vagas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Componente Card de Vaga
function JobCard({ job }: { job: Job }) {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `Há ${Math.floor(interval)} anos`;
    interval = seconds / 2592000;
    if (interval > 1) return `Há ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `Há ${Math.floor(interval)} dias`;
    interval = seconds / 3600;
    if (interval > 1) return `Há ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `Há ${Math.floor(interval)} minutos`;
    return `Há ${Math.floor(seconds)} segundos`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-neutral-900">{job.title}</h3>
      <p className="text-sm font-medium text-blue-600 mt-1">{job.category.name}</p>
      
      <div className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span>{job.institution.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{job.area.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{timeAgo(job.createdAt)}</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-neutral-700 line-clamp-2">
        {job.description}
      </p>

    </div>
  );
}


// Componente Card de Feature
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-6 text-xl font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-base text-neutral-600">{description}</p>
    </div>
  );
}