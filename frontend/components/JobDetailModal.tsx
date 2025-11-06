// NOVO ARQUIVO: frontend/components/JobDetailModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Briefcase, MapPin, Mail, Phone, User, Clock } from 'lucide-react';

// Tipagem completa para a vaga (ajuste conforme seu schema)
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
}

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JobDetailModal({ job, isOpen, onOpenChange }: JobDetailModalProps) {
  if (!job) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900">{job.title}</DialogTitle>
          <DialogDescription className="pt-1">
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                job.status === 'published' || job.status === 'open'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-neutral-100 text-neutral-800'
              }`}
            >
              {job.status}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-neutral-700">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-neutral-500" />
            <strong>Categoria:</strong> {job.category.name}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-neutral-500" />
            <strong>Área:</strong> {job.area.name}
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-neutral-500" />
            <strong>Postado por:</strong> {job.author.firstName} {job.author.lastName}
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
      </DialogContent>
    </Dialog>
  );
}