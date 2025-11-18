"use client";

// Imports de React e Next
import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link'; // Adicionado
import { useRouter } from 'next/navigation'; // Adicionado

// Imports dos componentes de UI reais de /components
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building,
  Loader2,
  LogIn,
  Briefcase,
  Filter,
  Waypoints,
  MapPin,
  Clock,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Adicionado
import { toast, Toaster } from 'sonner';

// --- Interfaces ---
interface Area {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  // Estados dos filtros
  const [filters, setFilters] = useState({ search: '', areaId: '', categoryId: '' });
  const [areas, setAreas] = useState<Area[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // --- NOVO ESTADO PARA O MODAL ---
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Hooks para o modal (reais)
  const { login } = useAuth(); // Adicionado
  const router = useRouter(); // Adicionado

  // --- Mocks para fazer o preview funcionar ---
  // REMOVIDO mockLogin
  // REMOVIDO mockRouter
  // --- Fim dos Mocks ---


  // --- Lógica de Busca ---

  useEffect(() => {
    document.title = 'Decola Vagas';
  }, []);

  useEffect(() => {
    const fetchPublicJobs = async () => {
      setLoadingJobs(true);
      try {
        const query = new URLSearchParams({
          search: filters.search,
          areaId: filters.areaId,
          categoryId: filters.categoryId,
        }).toString();

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/jobs/public?${query}`);

        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        } else {
          console.error("Falha ao buscar vagas, status:", res.status);
          setJobs([]); // Limpa as vagas em caso de erro
        }
      } catch (error) {
        console.error("Erro ao buscar vagas públicas:", error);
        setJobs([]); // Limpa as vagas em caso de erro
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchPublicJobs();
  }, [filters]);

  // Buscar Áreas e Categorias
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        // USA AS NOVAS ROTAS PÚBLICAS
        const [areaRes, catRes] = await Promise.all([
          fetch(`${apiUrl}/areas/public`),
          fetch(`${apiUrl}/categories/public`),
        ]);
        if (areaRes.ok) setAreas(await areaRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch (err) {
        console.error("Falha ao carregar dados para os filtros.");
      }
    };
    fetchFilterData();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-neutral-900">
              Decola Vagas
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            {/* --- BOTÃO ATUALIZADO PARA ABRIR O MODAL --- */}
            <Button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Entrar
            </Button>
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
            <Button asChild size="lg" className="text-lg px-6 py-3">
              <Link
                href="/register"
              >
                Começar agora
              </Link>
            </Button>
            {/* --- BOTÃO "FAZER LOGIN" ATUALIZADO PARA ABRIR O MODAL --- */}
            <Button variant="outline" size="lg" className="text-lg px-6 py-3" onClick={() => setShowLoginModal(true)}>
              Fazer Login
            </Button>
          </div>
        </section>

        {/* Vagas Recentes */}
        <section className="bg-white py-20 md:py-24">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="text-center text-3xl font-bold text-neutral-900 mb-4">
              Vagas Recentes
            </h2>
            <p className="text-center text-neutral-600 mb-12">
              Filtre as oportunidades abertas e encontre a ideal para você.
            </p>

            {/* Filtros Corrigidos */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Buscar por título..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="md:col-span-1 bg-white" // Adicionado bg-white para consistência
              />
              <Select value={filters.areaId} onValueChange={(value) =>
                setFilters(prev => ({ ...prev, areaId: value === 'all' ? '' : value }))}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Todas as Áreas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Áreas</SelectItem>
                  {areas.map(area => <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.categoryId} onValueChange={(value) =>
                setFilters(prev => ({ ...prev, categoryId: value === 'all' ? '' : value }))}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Todas as Categorias" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

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
                icon={Briefcase} // Ícone corrigido
                title="Vagas Centralizadas"
                description="Professores e coordenadores postam as vagas, e você encontra tudo aqui."
              />
              <FeatureCard
                icon={Waypoints} // Ícone corrigido
                title="Conexão Direta"
                description="Acesse oportunidades exclusivas da sua instituição de ensino."
              />
              <FeatureCard
                icon={Filter} // Ícone corrigido
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

      {/* --- MODAL DE LOGIN --- */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        login={login} // Passando o hook real
        router={router} // Passando o hook real
      />
      {/* Adiciona o Toaster para exibir notificações */}
      <Toaster richColors />
    </div>
  );
}

// --- NOVO COMPONENTE: MODAL DE LOGIN ---
// (Colocado dentro do mesmo arquivo por ser "use client")

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  login: (token: string) => Promise<any>; // Função do AuthContext (agora real)
  router: any; // Tipo do Next Router (agora real)
}

function LoginModal({ isOpen, onClose, login, router }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const LOGIN_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;

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

        // Chama a função de login do AuthContext
        const userData = await login(data.access_token);
        
        onClose(); // Fecha o modal

        // Lógica de redirecionamento (copiada de /login/page.tsx)
        if (userData) {
          const isGlobalAdmin = userData.institutions.some(
            (inst: any) => inst.role.name === 'admin' || inst.role.name === 'superadmin'
          );

          if (isGlobalAdmin) {
            router.push('/admin');
            return;
          }

          if (userData.activeInstitutionId) {
            const activeInstitution = userData.institutions.find(
              // Corrigido de institutionId para institution.id
              (inst: any) => inst.institution.id === userData.activeInstitutionId
            );
            const activeRole = activeInstitution?.role.name;

            if (activeRole && ['professor', 'coordenador'].includes(activeRole)) {
              router.push('/admin');
            } else {
              router.push('/dashboard');
            }
          } else {
            const isProfessorOrCoordenador = userData.institutions.some(
              (inst: any) => ['professor', 'coordenador'].includes(inst.role.name)
            );

            if (isProfessorOrCoordenador) {
              router.push('/admin');
            } else {
              router.push('/dashboard');
            }
          }
        } else {
          // Fallback caso userData seja nulo após o login
          toast.error("Não foi possível carregar seu perfil. Redirecionando...");
          router.push('/dashboard'); 
        }

      } else {
        const data = await res.json();
        const errorMessage = data.error || 'Falha no login. Verifique seus dados.';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Acesse sua conta
          </DialogTitle>
        </DialogHeader>

        {/* REMOVIDO o botão X duplicado. 
          O <DialogContent> de shadcn/ui já inclui um botão de fechar.
        */}

        <form onSubmit={handleSubmit} className="space-y-6 px-4 pb-4">
          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="email-modal"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Email
            </label>
            <Input
              type="email"
              id="email-modal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password-modal"
                className="block text-sm font-medium text-neutral-700"
              >
                Senha
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:underline"
                onClick={onClose} // Fecha o modal ao navegar
              >
                Esqueceu sua senha?
              </Link>
            </div>
            <Input
              type="password"
              id="password-modal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>

         <p className="mt-4 text-center text-sm text-neutral-600">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:underline"
              onClick={onClose} // Fecha o modal ao navegar
            >
              Cadastre-se
            </Link>
          </p>
      </DialogContent>
    </Dialog>
  );
}
// --- FIM DO NOVO COMPONENTE ---


// Componente Card de Vaga (Ícones corrigidos)
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
      
      <div className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
        <div className="flex items-center gap-2">
           <Briefcase className="h-4 w-4 text-blue-600" /> 
          <span>{job.category.name}</span>
        </div>
        <div className="flex items-center gap-2">
           <Building className="h-4 w-4 text-neutral-500" /> 
          <span>{job.institution.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-neutral-500" />
          <span>{job.area.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-neutral-500" />
          <span>{timeAgo(job.createdAt)}</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-neutral-700 line-clamp-2">
        {job.description}
      </p>

    </div>
  );
}


// Componente Card de Feature (Ícone corrigido)
function FeatureCard({
  icon: Icon, // Alterado para receber o componente do ícone
  title,
  description,
}: {
  icon: React.ElementType; // Tipo alterado
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <Icon className="h-6 w-6" /> {/* Renderiza o ícone */}
      </div>
      <h3 className="mt-6 text-xl font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-base text-neutral-600">{description}</p>
    </div>
  );
}