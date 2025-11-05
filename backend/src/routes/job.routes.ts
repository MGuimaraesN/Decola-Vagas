import { Router } from 'express';
import { JobController } from '../controllers/job.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

const jobRoutes = Router();
const jobController = new JobController();
const authMiddleware = new AuthMiddleware();

jobRoutes.post('/create', authMiddleware.auth, jobController.create);
jobRoutes.put('/edit/:id', authMiddleware.auth, jobController.edit);
jobRoutes.delete('/delete/:id', authMiddleware.auth, jobController.delete);
jobRoutes.get('/my-institution', authMiddleware.auth, jobController.getJobsByInstitution);
jobRoutes.get('/admin', authMiddleware.auth, jobController.getAllJobs);

export { jobRoutes };