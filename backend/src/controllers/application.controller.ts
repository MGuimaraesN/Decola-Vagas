import type { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';
import { sendApplicationFeedback, sendTrialLessonSchedule, sendMagicLink } from '../services/mail.service.js';
import jwt from 'jsonwebtoken';

export class ApplicationController {

    // ... Existing methods (apply, listMyApplications) ...
    // NOTE: Maintaining original simple logic for brevity but would usually refactor common checks.

    async apply(req: Request, res: Response) {
        // Pega o objeto user completo do middleware de autenticação
        const user = (req as any).user;
        const userId = user?.userId;
        const userEmail = user?.email; // Precisamos do email para notificar
        
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

            // 2. Dispara o e-mail de confirmação (sem bloquear a resposta)
            if (userEmail) {
                sendApplicationFeedback(userEmail, job.title)
                    .catch(err => console.error(`❌ Falha ao enviar e-mail de candidatura para ${userEmail}:`, err));
            }

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
                            area: true,
                            category: true,
                            author: { select: { firstName: true, lastName: true } }
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

    async getAllManagedApplications(req: Request, res: Response) {
        const userId = (req as any).user?.userId;
        const activeInstitutionId = (req as any).user?.activeInstitutionId;

        if (!userId) return res.status(401).json({ error: 'Não autenticado' });

        try {
            const userRoles = await prisma.userInstitutionRole.findMany({
                where: { userId },
                include: { role: true }
            });

            const isSuperAdmin = userRoles.some(ur => ur.role.name === 'superadmin');
            const isAdmin = userRoles.some(ur => 
                ur.institutionId === activeInstitutionId && ur.role.name === 'admin'
            );
            // New roles check
            const isDirector = userRoles.some(ur =>
                ur.institutionId === activeInstitutionId && ur.role.name === 'director'
            );
            const isHr = userRoles.some(ur =>
                ur.institutionId === activeInstitutionId && ur.role.name === 'hr'
            );
            const isRecruiter = !isSuperAdmin && !isAdmin && !isDirector && !isHr;

            let whereClause: any = {};

            if (isSuperAdmin) {
                whereClause = {}; 
            } else if (isAdmin || isDirector || isHr) {
                if (!activeInstitutionId) return res.status(400).json({ error: 'Nenhuma instituição ativa' });
                whereClause = {
                    job: { institutionId: activeInstitutionId }
                };
            } else {
                whereClause = {
                    job: { authorId: userId }
                };
            }

            const applications = await prisma.application.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            avatarUrl: true,
                            resumeUrl: true,
                            course: true
                        }
                    },
                    job: {
                        select: {
                            id: true,
                            title: true,
                            institution: { select: { name: true } },
                            isAcademic: true // Include this
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.json(applications);
        } catch (error) {
            console.error('Erro ao buscar candidaturas administrativas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async updateStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { status } = req.body;
        const userId = (req as any).user?.userId;

        // Simplified validation for new enum
        // PENDING, TRIAL_SCHEDULED, GRADED_PASSED, GRADED_FAILED, DOCS_PENDING, DOCS_SUBMITTED, HIRED, REJECTED

        try {
            const application = await prisma.application.findUnique({
                where: { id: Number(id) },
                include: { job: true }
            });

            if (!application) return res.status(404).json({ error: 'Candidatura não encontrada' });

            // Check permissions (SuperAdmin, Admin, Director, HR, Author)
            // Ideally should use RbacMiddleware logic or a helper
            const userRoles = await prisma.userInstitutionRole.findMany({ where: { userId }, include: { role: true } });
            
            // Allow almost anyone with a role in that institution to update status for now, restricted by UI
            const hasPermission = userRoles.some(ur =>
                ur.role.name === 'superadmin' ||
                (ur.institutionId === application.job.institutionId &&
                 ['admin', 'director', 'hr', 'professor', 'coordenador'].includes(ur.role.name))
            );

            if (!hasPermission) {
                 return res.status(403).json({ error: 'Sem permissão para gerenciar esta candidatura' });
            }

            const updated = await prisma.application.update({
                where: { id: Number(id) },
                data: { status }
            });

            // Notification logic...
            let message = `O status da sua candidatura mudou para: ${status}`;
            if (status === 'HIRED') message = `Parabéns! Você foi contratado!`;

            await prisma.notification.create({
                data: {
                    userId: application.userId,
                    title: 'Status da Candidatura',
                    message,
                    link: `/jobs/${application.jobId}`
                }
            });

            res.json(updated);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            res.status(500).json({ error: 'Erro ao atualizar status' });
        }
    }

    async getManagedApplicationById(req: Request, res: Response) {
        const { id } = req.params;
        const userId = (req as any).user?.userId;

        try {
            const application = await prisma.application.findUnique({
                where: { id: Number(id) },
                include: {
                    user: {
                        select: {
                            id: true, firstName: true, lastName: true, email: true,
                            avatarUrl: true, resumeUrl: true,
                            linkedinUrl: true, githubUrl: true, portfolioUrl: true,
                            course: true, graduationYear: true, bio: true
                        }
                    },
                    job: {
                        include: {
                            institution: { select: { name: true } },
                            area: true,
                            category: true
                        }
                    }
                }
            });

            if (!application) return res.status(404).json({ error: 'Candidatura não encontrada' });

            // Simplified Permission Check
            const userRoles = await prisma.userInstitutionRole.findMany({ where: { userId }, include: { role: true } });
            const hasPermission = userRoles.some(ur =>
                ur.role.name === 'superadmin' ||
                (ur.institutionId === application.job.institutionId) // Any role in the same institution can view? For now yes.
            );

            if (!hasPermission) {
                return res.status(403).json({ error: 'Sem permissão.' });
            }

            res.json(application);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar detalhes' });
        }
    }

    async cancelApplication(req: Request, res: Response) {
        const userId = (req as any).user?.userId;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: 'Não autenticado' });

        try {
            const application = await prisma.application.findUnique({
                where: { id: Number(id) }
            });

            if (!application) return res.status(404).json({ error: 'Candidatura não encontrada' });

            if (application.userId !== userId) {
                return res.status(403).json({ error: 'Permissão negada' });
            }

            if (application.status !== 'PENDING') {
                return res.status(400).json({ error: 'Não é possível cancelar uma candidatura que já foi analisada.' });
            }

            await prisma.application.delete({
                where: { id: Number(id) }
            });

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao cancelar candidatura:', error);
            res.status(500).json({ error: 'Erro interno ao cancelar' });
        }
    }

    // --- NEW FOX ENDPOINTS ---

    async scheduleTrial(req: Request, res: Response) {
        const { id } = req.params;
        const { date } = req.body;

        try {
            const application = await prisma.application.findUnique({
                where: { id: Number(id) },
                include: { user: true, job: true }
            });
            if (!application) return res.status(404).json({ error: 'Candidatura não encontrada' });

            const trialDate = new Date(date);

            await prisma.application.update({
                where: { id: Number(id) },
                data: {
                    trialLessonDate: trialDate,
                    status: 'TRIAL_SCHEDULED'
                }
            });

            // Email Notification
            sendTrialLessonSchedule(application.user.email, application.job.title, trialDate)
                .catch(err => console.error("Error sending trial email:", err));

            res.json({ message: 'Prova agendada com sucesso' });
        } catch(error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao agendar prova' });
        }
    }

    async gradeTrial(req: Request, res: Response) {
        const { id } = req.params;
        const { score, notes } = req.body;

        try {
            const application = await prisma.application.findUnique({
                where: { id: Number(id) },
                include: { user: true, job: true }
            });
            if (!application) return res.status(404).json({ error: 'Candidatura não encontrada' });

            const passingGrade = application.job.passingGrade || 0; // Default 0 if not set
            const passed = score >= passingGrade;

            const newStatus = passed ? 'GRADED_PASSED' : 'GRADED_FAILED';

            await prisma.application.update({
                where: { id: Number(id) },
                data: {
                    trialLessonScore: parseFloat(score),
                    trialLessonNotes: notes,
                    status: newStatus
                }
            });

            if (passed) {
                // Generate Magic Link
                // Payload: { applicationId, userId, jobId }
                // Expiry: 7 days
                const secret = process.env.JWT_SECRET!;
                const magicToken = jwt.sign(
                    { applicationId: application.id, userId: application.userId },
                    secret,
                    { expiresIn: '7d' }
                );

                const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/upload-portal/${magicToken}`;

                // Update Application status to DOCS_PENDING immediately?
                // Or user manually transitions? Requirement says "If score >= passingGrade: Update status to DOCS_PENDING"

                await prisma.application.update({
                    where: { id: Number(id) },
                    data: { status: 'DOCS_PENDING' }
                });

                // Send Email
                sendMagicLink(application.user.email, application.job.title, link)
                     .catch(err => console.error("Error sending magic link:", err));
            }

            res.json({ message: 'Avaliação registrada', status: newStatus });
        } catch (error) {
             console.error(error);
            res.status(500).json({ error: 'Erro ao registrar avaliação' });
        }
    }
}
