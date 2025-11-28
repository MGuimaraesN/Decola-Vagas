import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página não encontrada | Decola Vagas',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 animate-in zoom-in duration-500">
        <FileQuestion className="h-10 w-10 text-blue-600" />
      </div>
      
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
        Página não encontrada
      </h1>
      
      <p className="mb-8 max-w-md text-lg text-neutral-600">
        Desculpe, não conseguimos encontrar a página que você está procurando. Ela pode ter sido movida, excluída ou o link pode estar incorreto.
      </p>
      
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Início
          </Link>
        </Button>
      </div>
      
      <div className="mt-12 text-sm text-neutral-500">
        &copy; {new Date().getFullYear()} Decola Vagas
      </div>
    </div>
  );
}