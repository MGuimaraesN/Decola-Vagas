import type { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';
import { Prisma } from '@prisma/client';

export class JobController {

    async create(req: Request, res: Response) {
        // Agora 'status' é pego do body, com 'rascunho' como padrão
        const { title, description, areaId, categoryId, status, email, telephone, companyName } = req.body;
        const authorId = (req as any).user?.userId;
        const activeInstitutionId = (req as any).user?.activeInstitutionId;

        if (!authorId) {
             return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        if (!activeInstitutionId) {
            return res.status(400).json({ error: 'Nenhuma instituição ativa selecionada.' });
        }

        try {
            const userRole = await prisma.userInstitutionRole.findFirst({
                where: {
                    userId: authorId,
                    institutionId: activeInstitutionId,
                },
                include: { role: true },
            });

            const allowedRoles = ['professor', 'coordenador', 'empresa', 'admin', 'superadmin'];
            if (!userRole || !allowedRoles.includes(userRole.role.name)) {
                return res.status(403).json({ error: 'Você não tem permissão para criar vagas.' });
            }

            const isPublic = userRole.role.name === 'empresa';

            if (!title || !description || !areaId || !categoryId || !email || !telephone) {
            return res.status(400).json({ error: 'Todos os campos (exceto status) são obrigatórios.' });
        }

            const job = await prisma.job.create({
                data: {
                    title: title,
                    description: description,
                    areaId: areaId,
                    categoryId: categoryId,
                    status: status || 'rascunho', // Se nenhum status for enviado, salva como 'rascunho'
                    email: email,
                    telephone: telephone,
                    authorId: authorId,
                    institutionId: activeInstitutionId,
                    ip: req.ip || 'IP não disponível',
                    companyName: companyName,
                    isPublic: isPublic,
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
        // Adicionado 'status' aqui também
        const { title, description, areaId, categoryId, status, email, telephone, companyName } = req.body;
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
                where: {
                    userId: authorId,
                    institutionId: job.institutionId,
                },
                include: { role: true },
            });

            const isAdmin = userRole?.role.name === 'admin';
            const isSuperAdmin = userRole?.role.name === 'superadmin';

            if (job.authorId !== authorId && !isAdmin && !isSuperAdmin) {
                return res.status(403).json({ error: 'Você não tem permissão para editar esta vaga' });
            }

            const updatedJob = await prisma.job.update({
                where: { id: parseInt(id) },
                data: {
                    title: title,
                    description: description,
                    areaId: areaId,
                    categoryId: categoryId,
                    status: status, // Permite atualização de status
                    email: email,
                    telephone: telephone,
                    companyName: companyName,
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

            const userRole = await prisma.userInstitutionRole.findFirst({
                where: {
                    userId: authorId,
                    institutionId: job.institutionId,
                },
                include: { role: true },
            });

            const isSuperAdmin = userRole?.role.name === 'superadmin';

            if (job.authorId !== authorId && !isSuperAdmin) {
                return res.status(403).json({ error: 'Você não tem permissão para excluir esta vaga' });
            }

            await prisma.savedJob.deleteMany({
                where: { jobId: parseInt(id) },
            });

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
        const { search, areaId, categoryId } = req.query;

        if (!activeInstitutionId) {
            return res.status(400).json({ error: 'Nenhuma instituição ativa selecionada.' });
        }

        try {
            const filters: Prisma.JobWhereInput[] = [
                {
                    OR: [
                        { isPublic: false, institutionId: activeInstitutionId },
                        { isPublic: true },
                    ],
                },
            ];

            if (search) {
                filters.push({
                    title: {
                        contains: search as string,
                    },
                });
            }

            if (areaId) {
                filters.push({ areaId: parseInt(areaId as string) });
            }

            if (categoryId) {
                filters.push({ categoryId: parseInt(categoryId as string) });
            }

            const whereClause: Prisma.JobWhereInput = { AND: filters };

            const jobs = await prisma.job.findMany({
                where: whereClause,
                include: {
                    author: {
                        select: { firstName: true, lastName: true, email: true }
                    },
                    area: true,
                    category: true,
                    institution: {
                        select: { name: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc' // Ordena por mais recente
                }
            });
            res.status(200).json(jobs);
        } catch (error) {
            console.error('Erro ao buscar vagas por instituição:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    // --- FUNÇÃO ATUALIZADA ---
    async getPublicJobs(req: Request, res: Response) {
        try {
            const { search, areaId, categoryId } = req.query;

            // 1. Define os filtros básicos (status e query params)
            const whereFilters: Prisma.JobWhereInput = {
                status: { in: ['published', 'open'] } // Só queremos vagas ativas
            };

            if (search) {
                whereFilters.title = {
                    contains: search as string,
                };
            }

            if (areaId) {
                whereFilters.areaId = parseInt(areaId as string);
            }

            if (categoryId) {
                whereFilters.categoryId = parseInt(categoryId as string);
            }

            // 2. Busca TODAS as vagas de Empresa (isPublic: true)
            const publicJobs = await prisma.job.findMany({
                where: {
                    ...whereFilters,
                    isPublic: true,
                },
                include: {
                    area: true,
                    category: true,
                    institution: {
                        select: { name: true }
                    },
                },
                orderBy: {
                    createdAt: 'desc'
                },
                // Removemos o 'take' para buscar todas as vagas de empresa
            });

            // 3. Busca ALGUMAS vagas de Instituição (isPublic: false)
            // Vamos pegar as 5 mais recentes para misturar.
            const institutionJobs = await prisma.job.findMany({
                where: {
                    ...whereFilters,
                    isPublic: false,
                },
                include: {
                    area: true,
                    category: true,
                    institution: {
                        select: { name: true }
                    },
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5 // Pegamos 5 vagas recentes de instituições
            });

            // 4. Combina as duas listas
            let allJobs = [...publicJobs, ...institutionJobs];

            // 5. Reordena a lista combinada por data de criação
            allJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            // 6. Aplica o limite de 20 (que existia antes) à lista combinada
            const jobs = allJobs.slice(0, 20);

            res.status(200).json(jobs);
        } catch (error) {
            console.error('Erro ao buscar vagas públicas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async getById(req: Request, res: Response) {
        const { id } = req.params;
        const authorId = (req as any).user?.userId;

        if (!id) {
            return res.status(400).json({ error: 'O ID da vaga é obrigatório' });
        }

        try {
            const job = await prisma.job.findUnique({
                where: { id: parseInt(id) },
                include: {
                    area: true,
                    category: true,
                    author: {
                        select: { firstName: true, lastName: true }
                    },
                }
            });

            if (!job) {
                return res.status(404).json({ error: 'Vaga não encontrada' });
            }

            // TODO: Segurança - Verificar se o usuário (se não for admin) pertence à instituição da vaga
            // if (job.authorId !== authorId && !isAdmin) { ... }

            res.status(200).json(job);
        } catch (error) {
            console.error('Erro ao buscar vaga por ID:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getAllJobs(req: Request, res: Response) {
        try {
            // --- INÍCIO DA ALTERAÇÃO ---
            const authorId = (req as any).user?.userId;

            if (!authorId) {
                return res.status(401).json({ error: 'Usuário não autenticado.' });
            }

            // 1. Buscar todos os cargos do usuário
            const userRoles = await prisma.userInstitutionRole.findMany({
                where: { userId: authorId },
                include: { role: true }
            });
            const roleNames = userRoles.map(ur => ur.role.name);

            // 2. Verificar se é admin ou superadmin
            const isGlobalAdmin = roleNames.includes('admin') || roleNames.includes('superadmin');

            let whereClause: Prisma.JobWhereInput = {}; // Corrigido para let

            if (isGlobalAdmin) {
                // Admins e Superadmins veem TUDO
                whereClause = {};
            } else {
                // Outros (professor, coordenador, empresa) veem APENAS as que criaram
                whereClause = {
                    authorId: authorId
                };
            }
            
            // 3. Aplicar o filtro na query
            const jobs = await prisma.job.findMany({
                where: whereClause, // Aplica o filtro
                 include: {
                    author: {
                        select: { firstName: true, lastName: true, email: true }
                    },
                    area: true,
                    category: true,
                    institution: true,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            res.status(200).json(jobs);
            // --- FIM DA ALTERAÇÃO ---
        } catch (error) {
            console.error('Erro ao buscar todas as vagas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
