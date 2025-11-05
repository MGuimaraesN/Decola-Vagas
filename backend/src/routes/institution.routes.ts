import { Router } from 'express';
import { InstitutionController } from '../controllers/institution.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';
import { checkRole } from '../middlewares/rbac.middleware.js';

const institutionRoutes = Router();
const institutionController = new InstitutionController();
const authMiddleware = new AuthMiddleware();

institutionRoutes.post('/', authMiddleware.auth, checkRole(['superadmin']), institutionController.create);
institutionRoutes.get('/', authMiddleware.auth, checkRole(['superadmin']), institutionController.getAll);
institutionRoutes.get('/:id', authMiddleware.auth, checkRole(['superadmin']), institutionController.getById);
institutionRoutes.put('/:id', authMiddleware.auth, checkRole(['superadmin']), institutionController.update);
institutionRoutes.delete('/:id', authMiddleware.auth, checkRole(['superadmin']), institutionController.delete);

export { institutionRoutes };