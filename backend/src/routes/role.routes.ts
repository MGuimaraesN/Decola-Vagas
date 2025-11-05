import { Router } from 'express';
import { RoleController } from '../controllers/role.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

const roleRoutes = Router();
const roleController = new RoleController();
const authMiddleware = new AuthMiddleware();

roleRoutes.post('/', authMiddleware.auth, roleController.create);
roleRoutes.get('/', authMiddleware.auth, roleController.getAll);
roleRoutes.get('/:id', authMiddleware.auth, roleController.getById);
roleRoutes.put('/:id', authMiddleware.auth, roleController.update);
roleRoutes.delete('/:id', authMiddleware.auth, roleController.delete);

export { roleRoutes };