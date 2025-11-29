import type { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';
import { Prisma } from '@prisma/client';
import {
    sendNewJobNotification,
    sendJobModifiedNotification,
    sendJobUnavailableNotification
} from '../services/mail.service.js';

export class JobController {

    async create(req: Request, res: Response) {
        // Recebe institutionId do corpo da requisição (opcional)
        const { title, description, areaId, categoryId, status, email, telephone, companyName, institutionId } = req.body;
        const authorId = (req as any).user?.userId;
        const activeInstitutionId = (req as any).user?.activeInstitutionId;

        if (!authorId) {
             return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        try {
            // 1. Determinar qual a instituição alvo (enviada no body ou a ativa)
            let targetInstitutionId = activeInstitutionId;

            // Busca todas as roles do usuário para verificar permissões globais
            const userRoles = await prisma.userInstitutionRole.findMany({
                where: { userId: authorId },
                include: { role: true }
            });

            const isSuperAdmin = userRoles.some(ur => ur.role.name === 'superadmin');
            const isAdmin = userRoles.some(ur => ur.role.name === 'admin');

            // Se um ID foi enviado e o usuário tem permissão para escolher (Admin/Superadmin)
            if (institutionId && (isSuperAdmin || isAdmin)) {
                targetInstitutionId = parseInt(institutionId);
                
                // Se NÃO for superadmin, verifica se ele é membro da instituição alvo com cargo apropriado
                if (!isSuperAdmin) {
                    const hasAccessToTarget = userRoles.some(
                        ur => ur.institutionId === targetInstitutionId && 
                        ['admin', 'professor', 'coordenador'].includes(ur.role.name)
                    );
                    
                    if (!hasAccessToTarget) {
                        return res.status(403).json({ error: 'Você não tem permissão para criar vagas nesta instituição.' });
                    }
                }
            }

            if (!targetInstitutionId) {
                return res.status(400).json({ error: 'Nenhuma instituição definida para a vaga.' });
            }

            // Verifica cargo específico na instituição alvo (ou se é superadmin global)
            // Se for superadmin, permitimos direto. Se não, checamos o vínculo específico.
            let isPublic = false;
            
            if (!isSuperAdmin) {
                const targetRole = userRoles.find(ur => ur.institutionId === targetInstitutionId);
                if (!targetRole || !['professor', 'coordenador', 'empresa', 'admin'].includes(targetRole.role.name)) {
                     return res.status(403).json({ error: 'Permissão insuficiente na instituição selecionada.' });
                }
                isPublic = targetRole.role.name === 'empresa';
            }

            if (!title || !description || !areaId || !categoryId || !email || !telephone) {
                return res.status(400).json({ error: 'Todos os campos (exceto status e empresa) são obrigatórios.' });
            }

            const job = await prisma.job.create({
                data: {
                    title: title,
                    description: description,
                    areaId: parseInt(areaId),
                    categoryId: parseInt(categoryId),
                    status: status || 'rascunho',
                    email: email,
                    telephone: telephone,
                    authorId: authorId,
                    institutionId: targetInstitutionId, // Usa a instituição definida
                    ip: req.ip || 'IP não disponível',
                    companyName: companyName,
                    isPublic: isPublic,
                },
                include: {
                    institution: true
                }
            });

            // Lógica de notificação (mantida igual)
            if (['published', 'open'].includes(job.status)) {
                try {
                    let recipients: string[] = [];
                    if (job.isPublic) {
                        const allUsers = await prisma.user.findMany({ select: { email: true } });
                        recipients = allUsers.map(u => u.email);
                    } else {
                        const institutionUsers = await prisma.userInstitutionRole.findMany({
                            where: { institutionId: job.institutionId },
                            include: { user: { select: { email: true } } }
                        });
                        recipients = institutionUsers.map(ur => ur.user.email);
                    }
                    const uniqueRecipients = [...new Set(recipients)];
                    if (uniqueRecipients.length > 0) {
                        sendNewJobNotification(uniqueRecipients, job.title, job.institution.name)
                            .catch(err => console.error("Falha background envio email nova vaga:", err));
                    }
                } catch (emailError) {
                    console.error('Erro ao preparar envio de e-mail nova vaga:', emailError);
                }
            }

            res.status(201).json(job);
        } catch (error) {
            console.error('Erro ao criar vaga:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async edit(req: Request, res: Response) {
            const { id } = req.params;
            // 1. Receber institutionId do body
            const { title, description, areaId, categoryId, status, email, telephone, companyName, institutionId } = req.body;
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

                // Verificar permissões do usuário
                const userRoles = await prisma.userInstitutionRole.findMany({
                    where: { userId: authorId },
                    include: { role: true }
                });

                const isSuperAdmin = userRoles.some(ur => ur.role.name === 'superadmin');
                const isAdmin = userRoles.some(ur => ur.role.name === 'admin');

                // Verifica se tem permissão na instituição ATUAL da vaga
                // (Para editar, precisa ser autor, ou admin/superadmin)
                const hasPermissionOnCurrent = isSuperAdmin || (job.authorId === authorId) || 
                    userRoles.some(ur => ur.institutionId === job.institutionId && ur.role.name === 'admin');

                if (!hasPermissionOnCurrent) {
                    return res.status(403).json({ error: 'Você não tem permissão para editar esta vaga' });
                }

                // 2. Lógica para atualizar a instituição (se fornecida e diferente)
                let newInstitutionId = job.institutionId;
                
                if (institutionId && parseInt(institutionId) !== job.institutionId) {
                    // Apenas Admins e Superadmins podem mover vagas de instituição
                    if (!isAdmin && !isSuperAdmin) {
                        return res.status(403).json({ error: 'Apenas administradores podem alterar a instituição da vaga.' });
                    }

                    newInstitutionId = parseInt(institutionId);

                    // Se não for Superadmin, verifica se é Admin na NOVA instituição
                    if (!isSuperAdmin) {
                        const isTargetAdmin = userRoles.some(
                            ur => ur.institutionId === newInstitutionId && ur.role.name === 'admin'
                        );
                        if (!isTargetAdmin) {
                            return res.status(403).json({ error: 'Você não tem permissão na instituição de destino.' });
                        }
                    }
                }

                const isStatusChanged = status && status !== job.status;
                const isDescriptionChanged = description && description !== job.description;

                const updatedJob = await prisma.job.update({
                    where: { id: parseInt(id) },
                    data: {
                        title, 
                        description, 
                        areaId: parseInt(areaId), // Garante inteiros
                        categoryId: parseInt(categoryId), // Garante inteiros
                        status, 
                        email, 
                        telephone, 
                        companyName,
                        institutionId: newInstitutionId, // Atualiza ID da instituição
                    },
                });

                // Notificações (Lógica mantida)
                try {
                    if (isStatusChanged && status === 'closed') {
                        const savedJobs = await prisma.savedJob.findMany({
                            where: { jobId: job.id },
                            include: { user: { select: { email: true } } }
                        });
                        const recipients = savedJobs.map(sj => sj.user.email);
                        recipients.forEach(email => {
                            sendJobUnavailableNotification(email, job.title).catch(e => console.error(`Erro envio email`, e));
                        });

                    } else if (isStatusChanged || isDescriptionChanged) {
                        const savedJobs = await prisma.savedJob.findMany({
                            where: { jobId: job.id },
                            include: { user: { select: { email: true } } }
                        });
                        const recipients = savedJobs.map(sj => sj.user.email);
                        recipients.forEach(email => {
                            sendJobModifiedNotification(email, updatedJob.title).catch(e => console.error(`Erro envio email`, e));
                        });
                    }
                } catch (notifyError) {
                    console.error('Erro ao processar notificações de edição:', notifyError);
                }

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

        if (!authorId) { return res.status(401).json({ error: 'Usuário não autenticado.' }); }
        if (!id) { return res.status(400).json({ error: 'O ID da vaga é obrigatório' }); }

        try {
            const job = await prisma.job.findUnique({ where: { id: parseInt(id) } });
            if (!job) { return res.status(404).json({ error: 'Vaga não encontrada' }); }

            const userRole = await prisma.userInstitutionRole.findFirst({
                where: { userId: authorId, institutionId: job.institutionId },
                include: { role: true },
            });
            const isSuperAdmin = userRole?.role.name === 'superadmin';

            if (job.authorId !== authorId && !isSuperAdmin) {
                return res.status(403).json({ error: 'Você não tem permissão para excluir esta vaga' });
            }

            try {
                 const savedJobs = await prisma.savedJob.findMany({
                    where: { jobId: job.id },
                    include: { user: { select: { email: true } } }
                });
                const recipients = savedJobs.map(sj => sj.user.email);
                await Promise.all(recipients.map(email =>
                     sendJobUnavailableNotification(email, job.title).catch(e => console.error(`Erro envio email`, e))
                ));
            } catch (notifyError) { console.error('Erro nas notificações de delete:', notifyError); }

            await prisma.savedJob.deleteMany({ where: { jobId: parseInt(id) } });
            await prisma.job.delete({ where: { id: parseInt(id) } });

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao excluir vaga:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getJobsByInstitution(req: Request, res: Response) {
        const activeInstitutionId = (req as any).user?.activeInstitutionId;
        const userId = (req as any).user?.userId; 
        const { search, areaId, categoryId } = req.query;

        if (!userId) { return res.status(401).json({ error: 'Usuário não autenticado.' }); }

        try {
            const userRoles = await prisma.userInstitutionRole.findMany({
                where: { userId: userId },
                include: { role: true }
            });
            const roleNames = userRoles.map(ur => ur.role.name);
            const isGlobalAdmin = roleNames.includes('admin') || roleNames.includes('superadmin');

            const whereClause: Prisma.JobWhereInput = {};

            if (search && typeof search === 'string' && search.trim() !== '') {
                whereClause.title = { contains: search as string };
            }
            if (areaId && typeof areaId === 'string' && areaId.trim() !== '') {
                whereClause.areaId = parseInt(areaId as string);
            }
            if (categoryId && typeof categoryId === 'string' && categoryId.trim() !== '') {
                whereClause.categoryId = parseInt(categoryId as string);
            }

            if (!isGlobalAdmin) {
                if (!activeInstitutionId) {
                    return res.status(400).json({ error: 'Nenhuma instituição ativa selecionada.' });
                }
                whereClause.OR = [
                    { isPublic: false, institutionId: activeInstitutionId },
                    { isPublic: true },
                ];
            }

            const jobs = await prisma.job.findMany({
                where: whereClause,
                include: {
                    author: { select: { firstName: true, lastName: true, email: true } },
                    area: true,
                    category: true,
                    institution: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.status(200).json(jobs);
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getPublicJobs(req: Request, res: Response) {
        try {
            const { search, areaId, categoryId } = req.query;
            const whereFilters: Prisma.JobWhereInput = { status: { in: ['published', 'open'] } };

            if (search && typeof search === 'string' && search.trim() !== '') {
                whereFilters.title = { contains: search as string };
            }
            if (areaId && typeof areaId === 'string' && areaId.trim() !== '') {
                whereFilters.areaId = parseInt(areaId as string);
            }
            if (categoryId && typeof categoryId === 'string' && categoryId.trim() !== '') {
                whereFilters.categoryId = parseInt(categoryId as string);
            }

            const publicJobs = await prisma.job.findMany({
                where: { ...whereFilters, isPublic: true },
                include: {
                    area: true, category: true, institution: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
            });

            const institutionJobs = await prisma.job.findMany({
                where: { ...whereFilters, isPublic: false },
                include: {
                    area: true, category: true, institution: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            });

            let allJobs = [...publicJobs, ...institutionJobs];
            allJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const jobs = allJobs.slice(0, 20);

            res.status(200).json(jobs);
        } catch (error) {
            console.error('Erro ao buscar vagas públicas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) { return res.status(400).json({ error: 'O ID da vaga é obrigatório' }); }

        try {
            const job = await prisma.job.findUnique({
                where: { id: parseInt(id) },
                include: {
                    area: true, category: true,
                    author: { select: { firstName: true, lastName: true } },
                    institution: { select: { name: true } }
                }
            });
            if (!job) { return res.status(404).json({ error: 'Vaga não encontrada' }); }
            res.status(200).json(job);
        } catch (error) {
            console.error('Erro ao buscar vaga:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getAllJobs(req: Request, res: Response) {
        try {
            const authorId = (req as any).user?.userId;
            if (!authorId) { return res.status(401).json({ error: 'Usuário não autenticado.' }); }

            const userRoles = await prisma.userInstitutionRole.findMany({
                where: { userId: authorId },
                include: { role: true }
            });
            const roleNames = userRoles.map(ur => ur.role.name);
            const isGlobalAdmin = roleNames.includes('admin') || roleNames.includes('superadmin');

            let whereClause: Prisma.JobWhereInput = {}; 
            if (!isGlobalAdmin) {
                whereClause = { authorId: authorId };
            }
            
            const jobs = await prisma.job.findMany({
                where: whereClause,
                 include: {
                    author: { select: { firstName: true, lastName: true, email: true } },
                    area: true, category: true, institution: true,
                },
                orderBy: { createdAt: 'desc' }
            });
            res.status(200).json(jobs);
        } catch (error) {
            console.error('Erro ao buscar todas as vagas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}