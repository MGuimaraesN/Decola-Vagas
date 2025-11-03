import type { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';

export class CategoryController {

    async create(req: Request, res: Response) {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({error: "Nome da catergoria é obrigatório"})
            }

            const isCategoryExist = await prisma.category.findUnique({
                where: {name: name}
            });

            if (isCategoryExist) {
                return res.status(409).json({error: "Categoria já cadastrada"})
            }

            if (name) {
                const newCategory = await prisma.category.create({
                    data: {name: name}
                });
            }

            return res.status(201).json({message: "Categoria criada com sucesso"})
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            return res.status(500).json({error: 'Erro interno do servidor'});
        }
    }

    async getId (req: Request, res: Response){
        try {
            const {name} = req.body;

            if (!name) {
                return res.status(400).json({error: "Nome da catergoria é obrigatório"})
            }

            const category = await prisma.category.findUnique({
                where: {name: name}
            });

            if (!category) {
                return res.status(404).json({error: "Categoria não encontrada"})
            }
            
            return res.status(200).json({
                id: category?.id,
                name: category?.name
            });
        } catch (error) {
            console.error("Erro ao buscar categoria:" , error);
            return res.status(500).json({error: "Erro interno do servidor"});
        }
    }
};