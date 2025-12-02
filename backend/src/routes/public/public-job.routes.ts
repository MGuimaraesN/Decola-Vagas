import { Router } from 'express';
import { PublicJobController } from '../../controllers/public/public-job.controller.js';

const router = Router();
const publicJobController = new PublicJobController();

router.post('/jobs/apply-guest', publicJobController.applyAsGuest);

export { router as publicJobRoutes };
