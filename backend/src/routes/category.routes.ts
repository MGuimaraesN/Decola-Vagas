import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

const categoryRoutes = Router();
const categoryController = new CategoryController();
const authMiddleware = new AuthMiddleware();


categoryRoutes.post('/create', authMiddleware.auth, categoryController.create);
categoryRoutes.get('/get', authMiddleware.auth, categoryController.getId);

export { categoryRoutes };