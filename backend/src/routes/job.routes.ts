import { Router } from 'express';
import { createJob, editJob, deleteJob, getJobsByInstitution, getAllJobs } from '../controllers/job.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const jobRoutes = Router();

jobRoutes.post('/create', authMiddleware, createJob);
jobRoutes.put('/edit/:id', authMiddleware, editJob);
jobRoutes.delete('/delete/:id', authMiddleware, deleteJob);
jobRoutes.get('/my-institution', authMiddleware, getJobsByInstitution);
jobRoutes.get('/admin', authMiddleware, getAllJobs);

export { jobRoutes };
