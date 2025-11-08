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

                // Lógica especial para Superadmin
                if (allowedRoles.includes('superadmin')) {
                    const superadminRole = await prisma.userInstitutionRole.findFirst({
                        where: {
                            userId: userPayload.userId,
                            role: { name: 'superadmin' },
                        },
                    });
                    if (superadminRole) {
                        return next(); // Superadmin tem acesso
                    }
                }

                // Lógica padrão para outros cargos
                if (!userPayload.activeInstitutionId) {
                    return res.status(403).json({ error: 'Acesso negado: Nenhuma instituição ativa.' });
                }

                const userRole = await prisma.userInstitutionRole.findFirst({
                    where: {
                        userId: userPayload.userId,
                        institutionId: userPayload.activeInstitutionId,
                    },
                    include: { role: true },
                });

                if (!userRole || !allowedRoles.includes(userRole.role.name)) {
                    return res.status(403).json({ error: 'Acesso negado: Permissões insuficientes.' });
                }

                next();
            } catch (error) {
                res.status(500).json({ error: 'Erro interno ao verificar permissões.' });
            }
        }
    }
}
