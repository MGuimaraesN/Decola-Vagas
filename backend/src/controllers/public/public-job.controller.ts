import type { Request, Response } from 'express';
import { prisma } from '../../database/prisma.js';
import { ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class PublicJobController {

    async applyAsGuest(req: Request, res: Response) {
        try {
            const { jobId, email, firstName, lastName, telephone, resumeUrl } = req.body;

            if (!jobId || !email || !firstName || !lastName) {
                return res.status(400).json({ error: 'Dados incompletos.' });
            }

            // 1. Check if user exists
            let user = await prisma.user.findUnique({
                where: { email },
                include: { institutions: { include: { role: true } } }
            });

            let userId: number;

            if (!user) {
                // 2. Create "Shadow User" (Candidate)
                // Need a default institution for the candidate.
                // Usually candidates apply TO an institution, but the user account needs a home.
                // We'll try to find the institution of the Job being applied to.
                const job = await prisma.job.findUnique({ where: { id: parseInt(jobId) } });
                if (!job) return res.status(404).json({ error: 'Vaga não encontrada' });

                const tempPassword = crypto.randomBytes(8).toString('hex');
                const hashedPassword = await bcrypt.hash(tempPassword, 10);

                // Find candidate role ID
                const candidateRole = await prisma.role.findUnique({ where: { name: 'candidate' } });
                if (!candidateRole) return res.status(500).json({ error: 'Erro de configuração: Role candidate não encontrado.' });

                user = await prisma.user.create({
                    data: {
                        email,
                        firstName,
                        lastName,
                        password: hashedPassword,
                        ip: req.ip || '0.0.0.0',
                        activeInstitutionId: job.institutionId,
                        institutions: {
                            create: {
                                institutionId: job.institutionId,
                                roleId: candidateRole.id
                            }
                        }
                    },
                    include: { institutions: { include: { role: true } } }
                });

                // TODO: Send Welcome Email with credentials or magic link logic
                console.log(`Shadow user created for ${email}. Temp pass: ${tempPassword}`);
            }

            userId = user.id;

            // 3. Create Application
            // Check if already applied
            const existingApp = await prisma.application.findUnique({
                where: {
                    userId_jobId: {
                        userId: userId,
                        jobId: parseInt(jobId)
                    }
                }
            });

            if (existingApp) {
                return res.status(400).json({ error: 'Você já se candidatou para esta vaga.' });
            }

            const application = await prisma.application.create({
                data: {
                    userId,
                    jobId: parseInt(jobId),
                    status: ApplicationStatus.PENDING,
                    resumeUrl: resumeUrl || null
                }
            });

            // TODO: Notify Candidate (Email)
            // TODO: Notify Recruiters (Email)

            return res.status(201).json({
                message: 'Candidatura realizada com sucesso!',
                applicationId: application.id,
                isNewUser: !!user.createdAt // Rough check, improved by checking previous var
            });

        } catch (error) {
            console.error('Erro ao aplicar como guest:', error);
            return res.status(500).json({ error: 'Erro interno ao processar candidatura.' });
        }
    }
}
