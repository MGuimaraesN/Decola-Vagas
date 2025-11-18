import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { UserPayload } from '../types/express.js';

export class AuthMiddleware {

  async auth(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ error: 'Token inválido' });

        }

        const token = parts[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('Secret não está definido!');
        }

        const payload = jwt.verify(token as string, secret) as UserPayload;
        (req as any).user = payload;


        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

};
