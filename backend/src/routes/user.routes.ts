import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';

const userRoutes = Router();
const userController = new UserController();

// Quando uma requisição POST chegar em /register, chame o método register
userRoutes.post('/register', userController.register);

// Quando uma requisição POST chegar em /login, chame o método login
userRoutes.post('/login', userController.login);

export { userRoutes };