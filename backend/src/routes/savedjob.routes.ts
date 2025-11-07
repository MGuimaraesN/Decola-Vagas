import { Router } from 'express';
import { Router } from 'express';
import { saveJob, unsaveJob, getMySavedJobs, getMySavedJobIds } from '../controllers/savedjob.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

const router = Router();
const authMiddleware = new AuthMiddleware();

// Todas as rotas aqui exigem autenticação
router.use(authMiddleware.auth);

router.post('/:jobId', saveJob);
router.delete('/:jobId', unsaveJob);
router.get('/my-saved', getMySavedJobs);
router.get('/my-saved/ids', getMySavedJobIds);

export default router;
