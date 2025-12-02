import type { Request, Response } from 'express';
import { prisma } from '../../database/prisma.js';

export class UploadController {

    async validateToken(req: Request, res: Response) {
        // ... (Same logic as before, handled by controller)
        // Since this is a public GET, we validate token inside to return info.
        // Or could use middleware but we want to return JSON data not just 200/401.

        // REPLICATING PREVIOUS LOGIC FOR CONSISTENCY
        // Ideally should use common verify logic.
        const { token } = req.query;
        if (!token) return res.status(400).json({ valid: false });

        try {
             // We can import verify from a util, or just rely on the middleware's logic if this was a protected route.
             // But validate-token IS the check.
             const secret = process.env.JWT_SECRET!;
             const jwt = await import('jsonwebtoken'); // Dynamic import to avoid top level if needed, or standard import
             const decoded = jwt.default.verify(token as string, secret) as any;

             const app = await prisma.application.findUnique({
                 where: { id: decoded.applicationId },
                 include: { job: true, user: { select: { firstName: true } } }
             });

             if (!app) return res.json({ valid: false });

             return res.json({
                 valid: true,
                 applicationId: app.id,
                 jobTitle: app.job.title,
                 requiredDocs: app.job.requiredDocs,
                 candidateName: app.user.firstName
             });
        } catch (e) {
            return res.json({ valid: false });
        }
    }

    async uploadSensitive(req: Request, res: Response) {
        // Middleware has already validated token and attached applicationId
        const applicationId = (req as any).applicationId;
        const file = req.file;

        if (!file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

        try {
            const app = await prisma.application.findUnique({ where: { id: applicationId } });

            let currentDocs: string[] = [];
            try {
                if (app?.documentsUrl) {
                    currentDocs = JSON.parse(app.documentsUrl);
                }
            } catch {
                if (app?.documentsUrl) currentDocs = [app.documentsUrl];
            }

            const filePath = `/private_uploads/${file.filename}`;
            currentDocs.push(filePath);

            await prisma.application.update({
                where: { id: applicationId },
                data: {
                    documentsUrl: JSON.stringify(currentDocs),
                    status: 'DOCS_SUBMITTED',
                    docsStatus: 'SUBMITTED'
                }
            });

            res.json({ message: 'Arquivo enviado com sucesso', path: filePath });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro no processamento do arquivo' });
        }
    }
}
