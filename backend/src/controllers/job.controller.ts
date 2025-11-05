import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createJob = async (req: Request, res: Response) => {
    const { title, description, areaId, categoryId, status, email, telephone } = req.body;
    const authorId = (req as any).user.userId;
    const activeInstitutionId = (req as any).user.activeInstitutionId;

    if (!activeInstitutionId) {
        return res.status(400).json({ error: 'Nenhuma instituição ativa selecionada.' });
    }

    try {
        const job = await prisma.job.create({
            data: {
                title,
                description,
                areaId,
                categoryId,
                status,
                email,
                telephone,
                authorId,
                institutionId: activeInstitutionId,
                ip: req.ip || 'IP não disponível',
            },
        });
        res.status(201).json(job);
    } catch (error) {
        console.error('Erro ao criar vaga:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const editJob = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, areaId, categoryId, status, email, telephone } = req.body;
    const authorId = (req as any).user.userId;

    try {
        const job = await prisma.job.findUnique({
            where: { id: parseInt(id) },
        });

        if (!job) {
            return res.status(404).json({ error: 'Vaga não encontrada' });
        }

        if (job.authorId !== authorId) {
            return res.status(403).json({ error: 'Você não tem permissão para editar esta vaga' });
        }

        const updatedJob = await prisma.job.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                areaId,
                categoryId,
                status,
                email,
                telephone,
            },
        });
        res.status(200).json(updatedJob);
    } catch (error) {
        console.error('Erro ao editar vaga:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const deleteJob = async (req: Request, res: Response) => {
    const { id } = req.params;
    const authorId = (req as any).user.userId;

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
        console.error('Erro ao excluir vaga:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const getJobsByInstitution = async (req: Request, res: Response) => {
    const activeInstitutionId = (req as any).user.activeInstitutionId;

    if (!activeInstitutionId) {
        return res.status(400).json({ error: 'Nenhuma instituição ativa selecionada.' });
    }

    try {
        const jobs = await prisma.job.findMany({
            where: {
                institutionId: activeInstitutionId,
            },
        });
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Erro ao buscar vagas por instituição:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const getAllJobs = async (req: Request, res: Response) => {
    try {
        const jobs = await prisma.job.findMany();
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Erro ao buscar todas as vagas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
