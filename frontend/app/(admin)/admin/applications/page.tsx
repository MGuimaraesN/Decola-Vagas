'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, CheckCircle, XCircle, Search, 
  Loader2, User, Eye, Filter, Calendar, GraduationCap
} from 'lucide-react';

interface Application {
  id: number;
  status: string; // Updated type to string to support all new statuses
  createdAt: string;
  resumeUrl: string | null;
  trialLessonDate: string | null;
  trialLessonScore: number | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    resumeUrl: string | null;
    course: string | null;
  };
  job: {
    title: string;
    institution: { name: string };
    isAcademic: boolean;
  };
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/applications/manage`;

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filtered, setFiltered] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Form state
  const [trialDate, setTrialDate] = useState('');
  const [trialScore, setTrialScore] = useState('');
  const [trialNotes, setTrialNotes] = useState('');

  const { token } = useAuth();

  const fetchApplications = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
        setFiltered(data);
      }
    } catch (error) {
      toast.error('Erro ao buscar candidaturas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Admin: Candidaturas | Foxx Recruitment';
    fetchApplications();
  }, [token]);

  useEffect(() => {
    let result = applications;

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(app => 
        app.user.firstName.toLowerCase().includes(lower) ||
        app.user.lastName.toLowerCase().includes(lower) ||
        app.job.title.toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(app => app.status === statusFilter);
    }

    setFiltered(result);
  }, [search, statusFilter, applications]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(`Status atualizado para ${newStatus}`);
        fetchApplications();
      } else {
        toast.error('Erro ao atualizar status.');
      }
    } catch (error) {
      toast.error('Erro de rede.');
    }
  };

  const handleScheduleSubmit = async () => {
      if (!selectedApp || !trialDate) return;
      try {
          const res = await fetch(`${API_URL}/${selectedApp.id}/schedule`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ date: trialDate })
          });
          if (res.ok) {
              toast.success('Prova agendada!');
              setScheduleModalOpen(false);
              fetchApplications();
          } else toast.error('Erro ao agendar.');
      } catch (e) { toast.error('Erro de rede.'); }
  };

  const handleGradeSubmit = async () => {
      if (!selectedApp || !trialScore) return;
      try {
          const res = await fetch(`${API_URL}/${selectedApp.id}/grade`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ score: parseFloat(trialScore), notes: trialNotes })
          });
          if (res.ok) {
              const data = await res.json();
              toast.success(`Avaliação registrada: ${data.status}`);
              setGradeModalOpen(false);
              fetchApplications();
          } else toast.error('Erro ao avaliar.');
      } catch (e) { toast.error('Erro de rede.'); }
  };

  const openSchedule = (app: Application) => {
      setSelectedApp(app);
      setTrialDate('');
      setScheduleModalOpen(true);
  };

  const openGrade = (app: Application) => {
      setSelectedApp(app);
      setTrialScore('');
      setTrialNotes('');
      setGradeModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
      TRIAL_SCHEDULED: "bg-purple-50 text-purple-700 border-purple-200",
      GRADED_PASSED: "bg-teal-50 text-teal-700 border-teal-200",
      GRADED_FAILED: "bg-red-50 text-red-700 border-red-200",
      DOCS_PENDING: "bg-orange-50 text-orange-700 border-orange-200",
      DOCS_SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
      HIRED: "bg-green-100 text-green-800 border-green-200",
      REJECTED: "bg-gray-100 text-gray-600 border-gray-200"
    };
    const labels: any = {
      PENDING: "Pendente", TRIAL_SCHEDULED: "Prova Agendada", GRADED_PASSED: "Aprovado na Prova",
      GRADED_FAILED: "Reprovado na Prova", DOCS_PENDING: "Aguardando Docs",
      DOCS_SUBMITTED: "Docs Enviados", HIRED: "Contratado", REJECTED: "Rejeitado"
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${styles[status] || styles.PENDING}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Gestão de Candidaturas</h1>
          <p className="text-neutral-500 text-sm">Acompanhe o funil de contratação acadêmico.</p>
        </div>
      </div>

      {/* --- BARRA DE FILTROS --- */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1 border border-neutral-200 rounded-md px-3 bg-neutral-50">
            <Search className="h-4 w-4 text-neutral-400 shrink-0" />
            <Input 
                placeholder="Buscar por candidato ou vaga..." 
                className="border-none shadow-none focus-visible:ring-0 h-9 bg-transparent w-full text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white border-neutral-200 h-9 md:h-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="TRIAL_SCHEDULED">Prova Agendada</SelectItem>
                <SelectItem value="DOCS_SUBMITTED">Docs Enviados</SelectItem>
                <SelectItem value="HIRED">Contratado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>Candidato</TableHead>
              <TableHead>Vaga / Instituição</TableHead>
              <TableHead>Fase Atual</TableHead>
              <TableHead className="text-center">Acadêmico?</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600"/></TableCell></TableRow>
            ) : filtered.length > 0 ? (
              filtered.map((app) => (
                <TableRow key={app.id} className="hover:bg-neutral-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
                        {app.user.avatarUrl ? (
                           <img src={`${process.env.NEXT_PUBLIC_API_URL}${app.user.avatarUrl}`} alt="Avatar" className="h-full w-full object-cover" />
                        ) : <User className="h-4 w-4 text-neutral-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{app.user.firstName} {app.user.lastName}</p>
                        <p className="text-xs text-neutral-500">{app.user.course || 'Sem curso'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-neutral-900 text-sm">{app.job.title}</p>
                    <p className="text-xs text-neutral-500">{app.job.institution.name}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-center">
                    {app.job.isAcademic ? <CheckCircle className="h-4 w-4 text-blue-500 mx-auto" /> : <span className="text-neutral-300">-</span>}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* Workflow Actions */}
                      {app.job.isAcademic && app.status === 'PENDING' && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-purple-600 hover:bg-purple-50" title="Agendar Prova" onClick={() => openSchedule(app)}>
                              <Calendar className="h-4 w-4" />
                          </Button>
                      )}

                      {app.job.isAcademic && app.status === 'TRIAL_SCHEDULED' && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-teal-600 hover:bg-teal-50" title="Lançar Nota" onClick={() => openGrade(app)}>
                              <GraduationCap className="h-4 w-4" />
                          </Button>
                      )}

                      {/* General Actions */}
                      <Button size="icon" variant="ghost" asChild className="h-8 w-8 text-neutral-500 hover:text-blue-600" title="Ver Detalhes">
                        <Link href={`/admin/applications/${app.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>

                      {/* Quick Approval (Skip Logic) or Final Hire */}
                      {app.status === 'DOCS_SUBMITTED' && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" title="Validar e Contratar" onClick={() => handleStatusChange(app.id, 'HIRED')}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-neutral-500">Nenhuma candidatura encontrada.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Schedule Modal */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Agendar Prova Didática</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Data e Hora da Prova</Label>
                    <Input type="datetime-local" value={trialDate} onChange={e => setTrialDate(e.target.value)} />
                </div>
                <p className="text-sm text-neutral-500">O candidato receberá um email com esta data.</p>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleScheduleSubmit}>Confirmar Agendamento</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grading Modal */}
      <Dialog open={gradeModalOpen} onOpenChange={setGradeModalOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Avaliar Prova Didática</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Nota (0-10)</Label>
                    <Input type="number" step="0.1" min="0" max="10" value={trialScore} onChange={e => setTrialScore(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Parecer / Feedback</Label>
                    <Textarea value={trialNotes} onChange={e => setTrialNotes(e.target.value)} placeholder="Comentários sobre a aula..." />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setGradeModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleGradeSubmit}>Salvar Avaliação</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
