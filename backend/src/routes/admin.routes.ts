import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';
import { checkRole } from '../middlewares/rbac.middleware.js';

const adminRoutes = Router();
const adminController = new AdminController();
const authMiddleware = new AuthMiddleware();

adminRoutes.get(
  '/users',
  authMiddleware.auth,
  checkRole(['admin', 'superadmin']),
  adminController.getAllUsers
);
adminRoutes.get(
  '/users/:id',
  authMiddleware.auth,
  checkRole(['admin', 'superadmin']),
  adminController.getUserDetails
);
adminRoutes.post(
  '/users/assign-role',
  authMiddleware.auth,
  checkRole(['admin', 'superadmin']),
  adminController.assignRoleToUser
);
adminRoutes.delete(
  '/users/remove-role/:id',
  authMiddleware.auth,
  checkRole(['admin', 'superadmin']),
  adminController.removeRoleFromUser
);
adminRoutes.delete(
  '/users/:id',
  authMiddleware.auth,
  checkRole(['admin', 'superadmin']),
  adminController.deleteUser
);

export { adminRoutes };
