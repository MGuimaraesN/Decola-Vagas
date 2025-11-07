import type { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';

export class CompanyController {

    async create(req: Request, res: Response) {
        const { name, logoUrl, websiteUrl, description } = req.body;

        // Validação de entrada (do seu padrão)
        if (!name) {
            return res.status(400).json({ error: 'O nome da empresa é obrigatório' });
        }

        try {
            // Checagem de conflito (do seu padrão)
            const companyExists = await prisma.company.findUnique({
                where: { name: name },
            });

            if (companyExists) {
                return res.status(409).json({ error: 'Empresa já cadastrada' });
            }

            // Lógica de criação
            const company = await prisma.company.create({
                data: {
                    name,
                    logoUrl,
                    websiteUrl,
                    description
                },
            });
            res.status(201).json(company);
        } catch (error) {
            // Erro genérico (do seu padrão)
            console.error('Erro ao criar empresa:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const companies = await prisma.company.findMany();
            res.status(200).json(companies);
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;

        // Validação de ID (do seu padrão)
        if (!id) {
            return res.status(400).json({ error: 'O ID da empresa é obrigatório' });
        }

        try {
            const company = await prisma.company.findUnique({
                where: { id: parseInt(id) }, // Usando parseInt do seu padrão
            });

            if (!company) {
                return res.status(404).json({ error: 'Empresa não encontrada' });
            }

            res.status(200).json(company);
        } catch (error) {
            console.error('Erro ao buscar empresa por ID:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const { name, logoUrl, websiteUrl, description } = req.body;

        // Validação de ID (do seu padrão)
        if (!id) {
            return res.status(400).json({ error: 'O ID da empresa é obrigatório' });
        }

        // Validação de dados (do seu padrão)
         if (!name) {
            return res.status(400).json({ error: 'O nome é obrigatório para atualização' });
        }

        try {
            const updatedCompany = await prisma.company.update({
                where: { id: parseInt(id) }, // Usando parseInt
                data: {
                    name,
                    logoUrl,
                    websiteUrl,
                    description
                },
            });
            res.status(200).json(updatedCompany);
        } catch (error) {
            // Tratamento de erro P2025 (do seu padrão)
            if ((error as any).code === 'P2025') {
                 return res.status(404).json({ error: 'Empresa não encontrada para atualização' });
            }
            console.error('Erro ao atualizar empresa:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;

        // Validação de ID (do seu padrão)
        if (!id) {
            return res.status(400).json({ error: 'O ID da empresa é obrigatório' });
        }

        try {
            await prisma.company.delete({
                where: { id: parseInt(id) }, // Usando parseInt
            });

            res.status(204).send();
        } catch (error) {
            // Tratamento de erro P2025 (do seu padrão)
            if ((error as any).code === 'P2025') {
                 return res.status(404).json({ error: 'Empresa não encontrada para exclusão' });
            }
            console.error('Erro ao excluir empresa:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}