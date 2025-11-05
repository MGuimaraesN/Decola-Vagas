import { Router } from 'express';
import { RoleController } from '../controllers/role.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';
import { checkRole } from '../middlewares/rbac.middleware.js';

const roleRoutes = Router();
const roleController = new RoleController();
const authMiddleware = new AuthMiddleware();

roleRoutes.post('/', authMiddleware.auth, checkRole(['superadmin']), roleController.create);
roleRoutes.get('/', authMiddleware.auth, checkRole(['superadmin']), roleController.getAll);
roleRoutes.get('/:id', authMiddleware.auth, checkRole(['superadmin']), roleController.getById);
roleRoutes.put('/:id', authMiddleware.auth, checkRole(['superadmin']), roleController.update);
roleRoutes.delete('/:id', authMiddleware.auth, checkRole(['superadmin']), roleController.delete);

export { roleRoutes };