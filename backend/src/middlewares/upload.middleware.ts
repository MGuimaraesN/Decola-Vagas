import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prisma.js';
import multer from 'multer';
import path from 'path';

// --- Legacy Multer Config for Public Avatars/Resumes ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// --- New Middleware Class for Secure Uploads ---
export class UploadMiddleware {
    async validateUploadToken(req: Request, res: Response, next: NextFunction) {
        const token = req.headers['x-upload-token'] as string || req.query.token as string;

        if (!token) {
            return res.status(401).json({ error: 'Token de upload necessário.' });
        }

        try {
            const secret = process.env.JWT_SECRET!;
            const decoded = jwt.verify(token, secret) as any;

            const app = await prisma.application.findUnique({
                where: { id: decoded.applicationId }
            });

            if (!app) {
                return res.status(403).json({ error: 'Candidatura não encontrada.' });
            }

            (req as any).applicationId = decoded.applicationId;
            next();
        } catch (error) {
            return res.status(403).json({ error: 'Token inválido ou expirado.' });
        }
    }
}
