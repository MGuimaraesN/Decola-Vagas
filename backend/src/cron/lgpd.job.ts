import cron from 'node-cron';
import { prisma } from '../database/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRIVATE_UPLOADS_DIR = path.join(__dirname, '../../private_uploads');

export const startCronJobs = () => {
    // Run every day at 03:00 AM
    cron.schedule('0 3 * * *', async () => {
        console.log('[CRON] Starting LGPD Anonymization Job...');
        try {
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

            // Find old applications
            const oldApplications = await prisma.application.findMany({
                where: {
                    createdAt: { lt: twoYearsAgo },
                    // user: { email: { not: { contains: 'anonymized' } } } // Optional check
                },
                include: { user: true }
            });

            console.log(`[CRON] Found ${oldApplications.length} applications to anonymize.`);

            for (const app of oldApplications) {
                // 1. Delete Files
                if (app.documentsUrl) {
                    try {
                        let files: string[] = [];
                        try {
                            files = JSON.parse(app.documentsUrl);
                        } catch {
                            files = [app.documentsUrl];
                        }

                        for (const filePath of files) {
                            // Path is relative like /private_uploads/file.pdf.
                            // Need to resolve to absolute.
                            const cleanPath = filePath.replace('/private_uploads', '');
                            const fullPath = path.join(PRIVATE_UPLOADS_DIR, cleanPath);

                            if (fs.existsSync(fullPath)) {
                                fs.unlinkSync(fullPath);
                            }
                        }
                    } catch (e) {
                        console.error(`[CRON] Error deleting files for app ${app.id}:`, e);
                    }
                }

                // 2. Anonymize User Data (if user has no recent applications?
                // Careful not to delete active users. Maybe just anonymize the Application snapshot?
                // Requirement: "Overwrite names, emails... keep ID".
                // If the User entity is shared, we should only anonymize if they are inactive for 2 years total.
                // Let's check last login.

                const user = app.user;
                if (user.lastLogin && user.lastLogin < twoYearsAgo) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            firstName: 'Anonymized',
                            lastName: 'User',
                            email: `anonymized_${user.id}@foxx.deleted`,
                            password: '', // Invalidate login
                            ip: '0.0.0.0',
                            resumeUrl: null,
                            bio: null,
                            linkedinUrl: null,
                            githubUrl: null,
                            portfolioUrl: null,
                            course: null
                        }
                    });

                    // Also clear application specific data
                    await prisma.application.update({
                        where: { id: app.id },
                        data: {
                            documentsUrl: null,
                            resumeUrl: null,
                            trialLessonNotes: 'Anonymized'
                        }
                    });
                }
            }

            console.log('[CRON] LGPD Job Finished.');

        } catch (error) {
            console.error('[CRON] Error in LGPD Job:', error);
        }
    });
};
