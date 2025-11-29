import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

const applicationRoutes = Router();
const applicationController = new ApplicationController();
const authMiddleware = new AuthMiddleware();

applicationRoutes.post(
    '/apply',
    authMiddleware.auth,
    applicationController.apply
);

applicationRoutes.get(
    '/my-applications',
    authMiddleware.auth,
    applicationController.listMyApplications
);

export { applicationRoutes };
