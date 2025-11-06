import { Router } from 'express';
import { saveJob, unsaveJob, getMySavedJobs, getMySavedJobIds } from '../controllers/savedjob.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas aqui exigem autenticação
router.use(authMiddleware);

router.post('/:jobId', saveJob);
router.delete('/:jobId', unsaveJob);
router.get('/my-saved', getMySavedJobs);
router.get('/my-saved/ids', getMySavedJobIds);

export default router;
