import { Router } from 'express';
import { InstitutionController } from '../controllers/institution.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

const institutionRoutes = Router();
const institutionController = new InstitutionController();
const authMiddleware = new AuthMiddleware();

institutionRoutes.post('/', authMiddleware.auth, institutionController.create);
institutionRoutes.get('/', authMiddleware.auth, institutionController.getAll);
institutionRoutes.get('/:id', authMiddleware.auth, institutionController.getById);
institutionRoutes.put('/:id', authMiddleware.auth, institutionController.update);
institutionRoutes.delete('/:id', authMiddleware.auth, institutionController.delete);

export { institutionRoutes };