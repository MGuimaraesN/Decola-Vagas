import { Router } from 'express';
import { SavedJobController } from '../controllers/savedjob.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

const router = Router();
const savedJobController = new SavedJobController();
const authMiddleware = new AuthMiddleware();

// Todas as rotas aqui exigem autenticação
router.use(authMiddleware.auth);

router.post('/:jobId', savedJobController.save);
router.delete('/:jobId', savedJobController.unsave);
router.get('/my-saved', savedJobController.getMySavedJobs);
router.get('/my-saved/ids', savedJobController.getMySavedJobIds);

export default router;
