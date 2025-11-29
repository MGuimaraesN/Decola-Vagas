import type { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';

export class ApplicationController {
    async apply(req: Request, res: Response) {
        const userId = (req as any).user?.userId;
        const { jobId } = req.body;

        if (!userId) return res.status(401).json({ error: 'Não autenticado' });
        if (!jobId) return res.status(400).json({ error: 'Job ID é obrigatório' });

        try {
            const job = await prisma.job.findUnique({ where: { id: parseInt(jobId) } });
            if (!job || job.deletedAt) return res.status(404).json({ error: 'Vaga não encontrada' });

            if (!['published', 'open'].includes(job.status)) {
                 return res.status(400).json({ error: 'Vaga não está aceitando candidaturas' });
            }

            const existing = await prisma.application.findUnique({
                where: { userId_jobId: { userId, jobId: parseInt(jobId) } }
            });

            if (existing) {
                return res.status(409).json({ error: 'Você já se candidatou para esta vaga' });
            }

            const application = await prisma.application.create({
                data: {
                    userId,
                    jobId: parseInt(jobId),
                    status: 'PENDING'
                }
            });

            res.status(201).json(application);
        } catch (error) {
            console.error('Erro ao candidatar-se:', error);
            res.status(500).json({ error: 'Erro ao processar candidatura' });
        }
    }

    async listMyApplications(req: Request, res: Response) {
        const userId = (req as any).user?.userId;
        if (!userId) return res.status(401).json({ error: 'Não autenticado' });

        try {
            const applications = await prisma.application.findMany({
                where: { userId },
                include: {
                    job: {
                        include: {
                            institution: { select: { name: true } },
                            area: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json(applications);
        } catch (error) {
             console.error('Erro ao listar candidaturas:', error);
             res.status(500).json({ error: 'Erro ao listar candidaturas' });
        }
    }
}
