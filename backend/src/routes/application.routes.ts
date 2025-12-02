import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';
import { RbacMiddleware } from '../middlewares/rbac.middlewares.js';

const applicationRoutes = Router();
const applicationController = new ApplicationController();
const authMiddleware = new AuthMiddleware();
const rbacMiddleware = new RbacMiddleware();

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

// --- MANAGEMENT ROUTES ---
// Adding 'hr' and 'director' to permitted roles
const managementRoles = ['superadmin', 'admin', 'professor', 'coordenador', 'empresa', 'hr', 'director'];

applicationRoutes.get(
    '/manage/all',
    authMiddleware.auth,
    rbacMiddleware.checkRole(managementRoles),
    applicationController.getAllManagedApplications
);
applicationRoutes.get(
    '/manage/:id',
    authMiddleware.auth,
    rbacMiddleware.checkRole(managementRoles),
    applicationController.getManagedApplicationById
);
applicationRoutes.patch(
    '/manage/:id/status',
    authMiddleware.auth,
    rbacMiddleware.checkRole(managementRoles),
    applicationController.updateStatus
);

// --- NEW FOXX ROUTES ---
applicationRoutes.patch(
    '/manage/:id/schedule',
    authMiddleware.auth,
    rbacMiddleware.checkRole(['superadmin', 'admin', 'coordenador', 'director']), // Only higher roles usually schedule
    applicationController.scheduleTrial
);

applicationRoutes.patch(
    '/manage/:id/grade',
    authMiddleware.auth,
    rbacMiddleware.checkRole(['superadmin', 'admin', 'coordenador', 'director']), // Only higher roles grade
    applicationController.gradeTrial
);

applicationRoutes.delete(
    '/:id',
    authMiddleware.auth,
    applicationController.cancelApplication
);

export { applicationRoutes };
