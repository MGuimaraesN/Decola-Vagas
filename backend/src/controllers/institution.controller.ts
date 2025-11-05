import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createInstitution = async (req: Request, res: Response) => {
    const { name } = req.body;

    try {
        const institution = await prisma.institution.create({
            data: {
                name,
            },
        });
        res.status(201).json(institution);
    } catch (error)_ {
        console.error('Erro ao criar instituição:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const getInstitutions = async (req: Request, res: Response) => {
    try {
        const institutions = await prisma.institution.findMany();
        res.status(200).json(institutions);
    } catch (error) {
        console.error('Erro ao buscar instituições:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const getInstitutionById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const institution = await prisma.institution.findUnique({
            where: { id: parseInt(id) },
        });

        if (!institution) {
            return res.status(404).json({ error: 'Instituição não encontrada' });
        }

        res.status(200).json(institution);
    } catch (error) {
        console.error('Erro ao buscar instituição por ID:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const updateInstitution = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const updatedInstitution = await prisma.institution.update({
            where: { id: parseInt(id) },
            data: {
                name,
            },
        });
        res.status(200).json(updatedInstitution);
    } catch (error) {
        console.error('Erro ao atualizar instituição:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const deleteInstitution = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.institution.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir instituição:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
