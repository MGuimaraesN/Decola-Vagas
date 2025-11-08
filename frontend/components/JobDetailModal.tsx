// frontend/components/JobDetailModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Mail, Phone, User, Clock, Building, Bookmark } from 'lucide-react';

// Tipagem completa para a vaga, incluindo a empresa opcional
interface Job {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  email: string;
  telephone: string;
  area: { name: string };
  category: { name: string };
  author: { firstName: string; lastName: string };
  companyName?: string | null;
  institution: { name: string };
}

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void; // Alterado de onOpenChange para onClose para clareza
  isSaved: boolean;
  onToggleSave: (jobId: number) => void;
  isSaving: boolean;
}

export const JobDetailModal = ({ job, isOpen, onClose, isSaved, onToggleSave, isSaving }: JobDetailModalProps) => {
  if (!job) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
      <DialogHeader>
          <div className="flex justify-between items-start">
              <div>
                  <DialogTitle className="text-2xl font-bold text-neutral-900">{job.title}</DialogTitle>

                  {/* CORREÇÃO AQUI: Voltamos para DialogDescription... */}
                  <DialogDescription asChild className="pt-2 flex items-center gap-4 text-sm text-neutral-600">
                  {/* Usamos "asChild" para forçar o DialogDescription a NÃO renderizar
                    um <p> extra, e em vez disso usar a <div> abaixo como seu elemento.
                    Esta é a solução mais robusta.
                  */}
                  <div>
                      <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                              job.status === 'published' || job.status === 'open'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}
                      >
                          {job.status}
                      </span>

                      {/* ...e agora usamos <div>s que são permitidas dentro da <div> pai */}
                      {job.companyName && (
                          <div className="flex items-center">
                              <Building size={14} className="mr-1.5" /> {job.companyName}
                          </div>
                      )}

                      {/* Usamos optional chaining aqui por segurança */}
                      {job.institution?.name && (
                          <div className="flex items-center">
                              <MapPin size={14} className="mr-1.5" /> {job.institution.name}
                          </div>
                      )}
                  </div>
                  </DialogDescription>
              </div>
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleSave(job.id)}
                  disabled={isSaving}
                  aria-label="Salvar vaga"
              >
                  <Bookmark className={`h-6 w-6 ${isSaved ? 'text-blue-600 fill-current' : 'text-neutral-500'}`} />
              </Button>
          </div>
      </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4 text-sm text-neutral-700">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-neutral-500" />
            <strong>Categoria:</strong> {job.category.name}
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-neutral-500" />
            <strong>Postado por:</strong> {job.author?.firstName} {job.author?.lastName}
          </div>
           <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-500" />
            <strong>Data:</strong> {formatDate(job.createdAt)}
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold text-neutral-800 mb-2">Descrição Completa</h4>
          <div className="prose prose-sm max-w-none text-neutral-700 bg-neutral-50 p-4 rounded-md whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold text-neutral-800 mb-2">Informações de Contato</h4>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-700" />
              <a href={`mailto:${job.email}`} className="text-blue-700 hover:underline">
                {job.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-700" />
              <span className="text-neutral-800">{job.telephone}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
