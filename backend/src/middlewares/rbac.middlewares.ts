import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma.js';
import type { UserPayload } from '../types/express.js';

export class RbacMiddleware {
    checkRole = (allowedRoles: string[]) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const userPayload = (req as any).user as UserPayload;
                if (!userPayload?.userId || !userPayload.activeInstitutionId) {
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
