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
                include: {
                    institution: true
                }
            });

            // Enviar notificação de nova vaga
            // Apenas se status for 'published' ou 'open'
            if (['published', 'open'].includes(job.status)) {
                try {
                    let recipients: string[] = [];

                    if (job.isPublic) {
                        // Se pública, envia para todos (ou interessados - aqui simulado como todos para simplificar o MVP)
                        // Em produção, deve-se filtrar por preferências do usuário.
                        // CUIDADO: Em grandes bases, isso deve ser feito em chunks ou via fila de tarefas.
                        const allUsers = await prisma.user.findMany({ select: { email: true } });
                        recipients = allUsers.map(u => u.email);
                    } else {
                        // Se privada, envia apenas para usuários da mesma instituição
                        // Busca usuários que têm um papel na instituição da vaga
                        const institutionUsers = await prisma.userInstitutionRole.findMany({
                            where: { institutionId: job.institutionId },
                            include: { user: { select: { email: true } } }
                        });
                        recipients = institutionUsers.map(ur => ur.user.email);
                    }

                    // Remover duplicatas e e-mail do próprio autor (opcional, mas boa prática)
                    const uniqueRecipients = [...new Set(recipients)];

                    if (uniqueRecipients.length > 0) {
                        const institutionName = job.institution.name;
                        // Executa de forma assíncrona sem await para não bloquear a resposta
                        sendNewJobNotification(uniqueRecipients, job.title, institutionName)
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

            // Permite edição se for o autor, admin ou superadmin
            const isAdmin = userRole?.role.name === 'admin';
            const isSuperAdmin = userRole?.role.name === 'superadmin';

            if (job.authorId !== authorId && !isAdmin && !isSuperAdmin) {
                return res.status(403).json({ error: 'Você não tem permissão para editar esta vaga' });
            }

            // Identificar mudanças críticas
            const isStatusChanged = status && status !== job.status;
            // Para descrição, comparamos string. Se description não vier, assume que não mudou.
            const isDescriptionChanged = description && description !== job.description;

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

            // Notificações de edição
            try {
                // Se status mudou para 'closed', notifica usuários que salvaram
                if (isStatusChanged && status === 'closed') {
                     const savedJobs = await prisma.savedJob.findMany({
                        where: { jobId: job.id },
                        include: { user: { select: { email: true } } }
                    });

                    const recipients = savedJobs.map(sj => sj.user.email);
                    // Dispara envios em paralelo
                    recipients.forEach(email => {
                         sendJobUnavailableNotification(email, job.title).catch(e => console.error(`Erro envio email vaga indisponível para ${email}`, e));
                    });

                } else if (isStatusChanged || isDescriptionChanged) {
                    // Se houve mudança crítica (mas não fechou), notifica usuários que salvaram
                    const savedJobs = await prisma.savedJob.findMany({
                        where: { jobId: job.id },
                        include: { user: { select: { email: true } } }
                    });

                    const recipients = savedJobs.map(sj => sj.user.email);
                    recipients.forEach(email => {
                        sendJobModifiedNotification(email, updatedJob.title).catch(e => console.error(`Erro envio email vaga modificada para ${email}`, e));
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

            // Busca os cargos do usuário. Idealmente, isso deveria checar
            // se ele é superadmin em *qualquer* instituição, não apenas na da vaga.
            // A lógica de `getJobsByInstitution` está melhor para isso.
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

            // Notificar antes de deletar
            try {
                 const savedJobs = await prisma.savedJob.findMany({
                    where: { jobId: job.id },
                    include: { user: { select: { email: true } } }
                });

                const recipients = savedJobs.map(sj => sj.user.email);
                await Promise.all(recipients.map(email =>
                     sendJobUnavailableNotification(email, job.title).catch(e => console.error(`Erro envio email delete para ${email}`, e))
                ));
            } catch (notifyError) {
                 console.error('Erro nas notificações de delete:', notifyError);
            }

            // Deleta primeiro as vagas salvas associadas
            await prisma.savedJob.deleteMany({
                where: { jobId: parseInt(id) },
            });

            // Depois deleta a vaga
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

    /**
     * Esta é a função para o "Mural do Dashboard".
     * A correção está aqui.
     */
    async getJobsByInstitution(req: Request, res: Response) {
        const activeInstitutionId = (req as any).user?.activeInstitutionId;
        const userId = (req as any).user?.userId; 
        const { search, areaId, categoryId } = req.query;

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        try {
            // --- INÍCIO DA CORREÇÃO ---
            
            // 1. Busca TODOS os cargos do usuário, de TODAS as instituições
            const userRoles = await prisma.userInstitutionRole.findMany({
                where: { userId: userId },
                include: { role: true }
            });

            // 2. Verifica se ele é 'admin' or 'superadmin' em QUALQUER lugar
            const roleNames = userRoles.map(ur => ur.role.name);
            const isGlobalAdmin = roleNames.includes('admin') || roleNames.includes('superadmin');

            
            // 3. Monta a cláusula de busca
            const whereClause: Prisma.JobWhereInput = {};

            // 4. Adiciona os filtros de busca (search, area, category)
            if (search && typeof search === 'string' && search.trim() !== '') {
                whereClause.title = {
                    contains: search as string,
                };
            }
            if (areaId && typeof areaId === 'string' && areaId.trim() !== '') {
                whereClause.areaId = parseInt(areaId as string);
            }
            if (categoryId && typeof categoryId === 'string' && categoryId.trim() !== '') {
                whereClause.categoryId = parseInt(categoryId as string);
            }

            // 5. Adiciona a lógica de permissão (O PONTO PRINCIPAL DA CORREÇÃO)
            if (!isGlobalAdmin) {
                // Se NÃO for admin, filtra pela instituição ativa E vagas públicas
                if (!activeInstitutionId) {
                    return res.status(400).json({ error: 'Nenhuma instituição ativa selecionada.' });
                }
                
                whereClause.OR = [
                    { isPublic: false, institutionId: activeInstitutionId }, // Vagas da instituição
                    { isPublic: true }, // Vagas de empresa
                ];
            }
            // Se FOR admin global, NENHUM filtro de instituição ou 'isPublic' é adicionado.
            // O `whereClause` conterá apenas os filtros de busca (search, area, etc).
            // Se nenhum filtro for passado, `whereClause` será `{}` e buscará TUDO.

            // --- FIM DA CORREÇÃO ---

            const jobs = await prisma.job.findMany({
                where: whereClause, // 6. Executa a query com a cláusula 'where' corrigida
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

            // --- CORREÇÃO APLICADA AQUI TAMBÉM ---
            if (search && typeof search === 'string' && search.trim() !== '') {
                whereFilters.title = {
                    contains: search as string,
                };
            }

            if (areaId && typeof areaId === 'string' && areaId.trim() !== '') {
                whereFilters.areaId = parseInt(areaId as string);
            }

            if (categoryId && typeof categoryId === 'string' && categoryId.trim() !== '') {
                whereFilters.categoryId = parseInt(categoryId as string);
            }
            // --- FIM DA CORREÇÃO ---

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
                     // --- Adicionado para ter o nome da instituição ---
                    institution: {
                        select: { name: true }
                    }
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