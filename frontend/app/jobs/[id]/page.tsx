"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Building2, MapPin, Calendar } from 'lucide-react';

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

export default function JobDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const headers: any = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, { headers });
                if (res.ok) {
                    setJob(await res.json());
                } else {
                    toast.error("Vaga não encontrada ou acesso restrito.");
                    router.push('/');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchJob();
    }, [id, token, router]);

    const handleApply = async () => {
        if (!token) {
            toast.error("Você precisa estar logado para se candidatar.");
            router.push('/login');
            return;
        }

        setApplying(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ jobId: id })
            });

            if (res.ok) {
                toast.success("Candidatura realizada com sucesso!");
                setHasApplied(true);
            } else {
                const json = await res.json();
                toast.error(json.error || "Erro ao se candidatar.");
                if (res.status === 409) setHasApplied(true);
            }
        } catch (error) {
            toast.error("Erro de rede.");
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Carregando...</div>;
    if (!job) return null;

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 mb-2">{job.title}</h1>
                            <div className="flex items-center text-neutral-500 gap-4 flex-wrap">
                                <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {job.institution.name}</span>
                                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.area.name}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        {['published', 'open'].includes(job.status) && (
                            <Button size="lg" onClick={handleApply} disabled={applying || hasApplied}>
                                {hasApplied ? "Já Candidatado" : (applying ? "Enviando..." : "Candidatar-se")}
                            </Button>
                        )}
                    </div>

                    <div className="prose max-w-none text-neutral-700">
                        <div dangerouslySetInnerHTML={{ __html: job.description }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
