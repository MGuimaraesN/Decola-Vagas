import type { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';

export class JobController {

    async create(req: Request, res: Response) {
        const { title, description, areaId, categoryId, status, email, telephone } = req.body;
        const authorId = (req as any).user?.userId;
        const activeInstitutionId = (req as any).user?.activeInstitutionId;

        if (!authorId) {
             return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        if (!activeInstitutionId) {
            return res.status(400).json({ error: 'Nenhuma instituição ativa selecionada.' });
        }

        if (!title || !description || !areaId || !categoryId || !status || !email || !telephone) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        try {
            const job = await prisma.job.create({
                data: {
                    title: title,
                    description: description,
                    areaId: areaId,
                    categoryId: categoryId,
                    status: status,
                    email: email,
                    telephone: telephone,
                    authorId: authorId,
                    institutionId: activeInstitutionId,
                    ip: req.ip || 'IP não disponível',
                },
            });
            res.status(201).json(job);
        } catch (error) {
            console.error('Erro ao criar vaga:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async edit(req: Request, res: Response) {
        const { id } = req.params;
        const { title, description, areaId, categoryId, status, email, telephone } = req.body;
        const authorId = (req as any).user?.userId

        if (!authorId) {
             return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        if (!id) {
            return res.status(400).json({ error: 'O ID da vaga é obrigatório' });
        }

        try {
            const job = await prisma.job.findUnique({
                where: { id: parseInt(id) },
            });

            if (!job) {
                return res.status(404).json({ error: 'Vaga não encontrada' });
            }

            const userRole = await prisma.userInstitutionRole.findFirst({
                where: {userId: parseInt(authorId)}
            });

            if (userRole?.roleId !== 2 && userRole?.roleId !== 1 ) {
                if(job.authorId !== authorId) {
                    return res.status(403).json({ error: 'Você não tem permissão para editar esta vaga' });
                }
            }

            const updatedJob = await prisma.job.update({
                where: { id: parseInt(id) },
                data: {
                    title: title,
                    description: description,
                    areaId: areaId,
                    categoryId: categoryId,
                    status: status,
                    email: email,
                    telephone: telephone,
                },
            });
            res.status(200).json(updatedJob);
        } catch (error) {
            if ((error as any).code === 'P2025') {
                 return res.status(404).json({ error: 'Vaga não encontrada para atualização' });
            }
            console.error('Erro ao editar vaga:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const authorId = (req as any).user?.userId;

        if (!authorId) {
             return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        if (!id) {
            return res.status(400).json({ error: 'O ID da vaga é obrigatório' });
        }

        try {
            const job = await prisma.job.findUnique({
                where: { id: parseInt(id) },
            });

            if (!job) {
                return res.status(404).json({ error: 'Vaga não encontrada' });
            }

            if (job.authorId !== authorId) {
                return res.status(403).json({ error: 'Você não tem permissão para excluir esta vaga' });
            }

            await prisma.job.delete({
                where: { id: parseInt(id) },
            });

            res.status(204).send();
        } catch (error) {
            if ((error as any).code === 'P2025') {
                 return res.status(404).json({ error: 'Vaga não encontrada para exclusão' });
            }
            console.error('Erro ao excluir vaga:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getJobsByInstitution(req: Request, res: Response) {
        const activeInstitutionId = (req as any).user?.activeInstitutionId;

        if (!activeInstitutionId) {
            return res.status(400).json({ error: 'Nenhuma instituição ativa selecionada.' });
        }

        try {
            const jobs = await prisma.job.findMany({
                where: {
                    institutionId: activeInstitutionId,
                },
                include: {
                    author: {
                        select: { firstName: true, lastName: true, email: true }
                    },
                    area: true,
                    category: true,
                }
            });
            res.status(200).json(jobs);
        } catch (error) {
            console.error('Erro ao buscar vagas por instituição:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'O ID da vaga é obrigatório' });
        }

        try {
            const job = await prisma.job.findUnique({
                where: { id: parseInt(id) },
            });

            if (!job) {
                return res.status(404).json({ error: 'Vaga não encontrado' });
            }

            res.status(200).json(job);
        } catch (error) {
            console.error('Erro ao buscar vaga por ID:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getAllJobs(req: Request, res: Response) {
        try {
            const jobs = await prisma.job.findMany({
                 include: {
                    author: {
                        select: { firstName: true, lastName: true, email: true }
                    },
                    area: true,
                    category: true,
                    institution: true,
                }
            });
            res.status(200).json(jobs);
        } catch (error) {
            console.error('Erro ao buscar todas as vagas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}