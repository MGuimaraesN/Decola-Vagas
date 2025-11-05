import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';
import { checkRole } from '../middlewares/rbac.middleware.js';

const categoryRoutes = Router();
const categoryController = new CategoryController();
const authMiddleware = new AuthMiddleware();

categoryRoutes.get('/', authMiddleware.auth, categoryController.getAll);
categoryRoutes.get('/:id', authMiddleware.auth, categoryController.getById);
categoryRoutes.post('/', authMiddleware.auth, checkRole(['admin', 'superadmin']), categoryController.create);
categoryRoutes.put('/:id', authMiddleware.auth, checkRole(['admin', 'superadmin']), categoryController.update);
categoryRoutes.delete('/:id', authMiddleware.auth, checkRole(['admin', 'superadmin']), categoryController.delete);

export { categoryRoutes };
