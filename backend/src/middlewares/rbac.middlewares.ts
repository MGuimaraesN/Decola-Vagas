// mguimaraesn/decola-vagas/Decola-Vagas-refactor-auth-logic/backend/src/middlewares/rbac.middlewares.ts

import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma.js';
import type { UserPayload } from '../types/express.js';

export class RbacMiddleware {
    checkRole = (allowedRoles: string[]) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const userPayload = (req as any).user as UserPayload;
                if (!userPayload?.userId) {
                    return res.status(401).json({ error: 'Acesso negado: Usuário não autenticado.' });
                }

                // --- LOGIC START ---

                // 1. Separate global roles (do NOT require active institution context)
                // Director might be considered semi-global depending on requirement,
                // but requirement says Director has Read-All and Approval rights.
                // Typically Director is per-institution, but with high privilege.
                // For now, treat Director as Institution Specific unless told otherwise.
                // Superadmin is definitely global. Admin is global/per-inst ambiguous in some systems but here seems global or high-level.
                const globalRoles = allowedRoles.filter(
                    role => role === 'superadmin' || role === 'admin'
                );

                if (globalRoles.length > 0) {
                    const userGlobalRole = await prisma.userInstitutionRole.findFirst({
                        where: {
                            userId: userPayload.userId,
                            role: { name: { in: globalRoles } },
                        },
                    });

                    if (userGlobalRole) {
                        return next();
                    }
                }

                // 2. Separate institution-specific roles
                const institutionSpecificRoles = allowedRoles.filter(
                    role => role !== 'superadmin' && role !== 'admin'
                );

                if (institutionSpecificRoles.length > 0) {
                    // Check active institution
                    if (!userPayload.activeInstitutionId) {
                        // Allow if the user has this role in ANY institution? No, system context is usually current institution.
                        // However, for some candidate operations, they might not have "Active Institution" selected in UI if they are just candidates.
                        // But typically RBAC protects routes that assume an active context.
                        return res.status(403).json({ error: 'Acesso negado: Nenhuma instituição ativa.' });
                    }

                    const userRole = await prisma.userInstitutionRole.findFirst({
                        where: {
                            userId: userPayload.userId,
                            institutionId: userPayload.activeInstitutionId,
                        },
                        include: { role: true },
                    });

                    if (!userRole || !institutionSpecificRoles.includes(userRole.role.name)) {
                        return res.status(403).json({ error: 'Acesso negado: Permissões insuficientes para esta instituição.' });
                    }

                    return next();
                }

                // 3. Fallback
                return res.status(403).json({ error: 'Acesso negado: Permissões insuficientes.' });

            } catch (error) {
                res.status(500).json({ error: 'Erro interno ao verificar permissões.' });
            }
        }
    }
}
