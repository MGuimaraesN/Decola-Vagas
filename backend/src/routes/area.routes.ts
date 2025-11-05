import { Router } from 'express';
import { AreaController } from '../controllers/area.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';
import { checkRole } from '../middlewares/rbac.middleware.js';

const areaRoutes = Router();
const areaController = new AreaController();
const authMiddleware = new AuthMiddleware();

areaRoutes.get('/', authMiddleware.auth, areaController.getAll);
areaRoutes.get('/:id', authMiddleware.auth, areaController.getById);
areaRoutes.post('/', authMiddleware.auth, checkRole(['admin', 'superadmin']), areaController.create);
areaRoutes.put('/:id', authMiddleware.auth, checkRole(['admin', 'superadmin']), areaController.update);
areaRoutes.delete('/:id', authMiddleware.auth, checkRole(['admin', 'superadmin']), areaController.delete);

export { areaRoutes };
