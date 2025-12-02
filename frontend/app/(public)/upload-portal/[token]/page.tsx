'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function UploadPortalPage() {
    const { token } = useParams();
    const router = useRouter();

    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [data, setData] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token) return;
        const validate = async () => {
            try {
                const res = await fetch(`${API_URL}/upload/validate-token?token=${token}`);
                const json = await res.json();
                if (json.valid) {
                    setIsValid(true);
                    setData(json);
                } else {
                    setIsValid(false);
                }
            } catch (e) {
                setIsValid(false);
            }
        };
        validate();
    }, [token]);

    const handleUpload = async () => {
        if (!file || !token) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/upload/sensitive`, {
                method: 'POST',
                headers: {
                    'x-upload-token': token as string
                },
                body: formData
            });

            if (res.ok) {
                setIsSuccess(true);
                toast.success('Documentos enviados com sucesso!');
            } else {
                toast.error('Erro no envio. Tente novamente.');
            }
        } catch (error) {
            toast.error('Erro de rede.');
        } finally {
            setIsUploading(false);
        }
    };

    if (isValid === null) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    if (!isValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
                <Card className="max-w-md w-full text-center p-6">
                    <div className="flex justify-center mb-4"><AlertCircle className="h-12 w-12 text-red-500" /></div>
                    <h1 className="text-xl font-bold text-neutral-900 mb-2">Link Inválido ou Expirado</h1>
                    <p className="text-neutral-500 mb-6">Este link de upload não está mais disponível. Entre em contato com o RH se acredita que isso é um erro.</p>
                    <Button onClick={() => router.push('/')}>Voltar para Home</Button>
                </Card>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
                <Card className="max-w-md w-full text-center p-6">
                    <div className="flex justify-center mb-4"><CheckCircle className="h-12 w-12 text-green-500" /></div>
                    <h1 className="text-xl font-bold text-neutral-900 mb-2">Envio Confirmado!</h1>
                    <p className="text-neutral-500 mb-6">Seus documentos foram recebidos e estão em análise. Você receberá atualizações por email.</p>
                    <Button onClick={() => router.push('/')}>Voltar para Home</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-neutral-900">Foxx Recruitment</h1>
                <p className="text-neutral-500">Portal de Admissão Seguro</p>
            </div>

            <Card className="max-w-lg w-full">
                <CardHeader>
                    <CardTitle>Bem-vindo(a), {data.candidateName}</CardTitle>
                    <CardDescription>
                        Você foi aprovado(a) na etapa prática para a vaga <strong>{data.jobTitle}</strong>.
                        Por favor, envie os documentos listados abaixo para formalizar sua contratação.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-900 mb-2 text-sm">Documentos Necessários:</h3>
                        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                            {data.requiredDocs && Array.isArray(data.requiredDocs) ? (
                                data.requiredDocs.map((doc: string, i: number) => <li key={i}>{doc}</li>)
                            ) : (
                                <li>Documentos pessoais (RG, CPF)</li>
                            )}
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-neutral-700">Selecione o arquivo (PDF ou ZIP)</label>
                        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-neutral-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept=".pdf,.zip,.rar"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <UploadCloud className="h-8 w-8 text-neutral-400 mb-3" />
                            {file ? (
                                <p className="text-sm font-semibold text-blue-600">{file.name}</p>
                            ) : (
                                <>
                                    <p className="text-sm font-medium text-neutral-700">Clique para selecionar</p>
                                    <p className="text-xs text-neutral-400 mt-1">Máximo 10MB</p>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setFile(null)} disabled={!file || isUploading}>Limpar</Button>
                    <Button onClick={handleUpload} disabled={!file || isUploading} className="bg-blue-600 hover:bg-blue-700">
                        {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : 'Enviar Documentos'}
                    </Button>
                </CardFooter>
            </Card>

            <p className="mt-8 text-xs text-neutral-400">
                &copy; {new Date().getFullYear()} Foxx Recruitment. Upload Seguro.
            </p>
        </div>
    );
}
