import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

const userRoutes = Router();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();

userRoutes.post('/register', userController.register);
userRoutes.post('/login', userController.login);
userRoutes.get('/profile', authMiddleware.auth, userController.profile);
userRoutes.post('/change-password', authMiddleware.auth, userController.changePassword)
userRoutes.post('/switch-institution', authMiddleware.auth, userController.switchInstitution);

export { userRoutes };