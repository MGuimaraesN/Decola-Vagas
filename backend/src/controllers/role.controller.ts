import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createRole = async (req: Request, res: Response) => {
    const { name } = req.body;

    try {
        const role = await prisma.role.create({
            data: {
                name,
            },
        });
        res.status(201).json(role);
    } catch (error) {
        console.error('Erro ao criar cargo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const getRoles = async (req: Request, res: Response) => {
    try {
        const roles = await prisma.role.findMany();
        res.status(200).json(roles);
    } catch (error) {
        console.error('Erro ao buscar cargos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const getRoleById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const role = await prisma.role.findUnique({
            where: { id: parseInt(id) },
        });

        if (!role) {
            return res.status(404).json({ error: 'Cargo não encontrado' });
        }

        res.status(200).json(role);
    } catch (error) {
        console.error('Erro ao buscar cargo por ID:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const updateRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const updatedRole = await prisma.role.update({
            where: { id: parseInt(id) },
            data: {
                name,
            },
        });
        res.status(200).json(updatedRole);
    } catch (error) {
        console.error('Erro ao atualizar cargo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const deleteRole = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.role.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir cargo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
