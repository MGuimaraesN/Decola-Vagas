import { Router } from 'express';
import { AreaController } from '../controllers/area.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';

const areaRoutes = Router();
const areaController = new AreaController();
const authMiddleware = new AuthMiddleware();

areaRoutes.get('/', authMiddleware.auth, areaController.getAll);
areaRoutes.get('/:id', authMiddleware.auth, areaController.getById);
areaRoutes.post('/', authMiddleware.auth, areaController.create);
areaRoutes.put('/:id', authMiddleware.auth, areaController.update);
areaRoutes.delete('/:id', authMiddleware.auth, areaController.delete);

export { areaRoutes };
