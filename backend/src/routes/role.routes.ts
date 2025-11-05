import { Router } from 'express';
import { createRole, getRoles, getRoleById, updateRole, deleteRole } from '../controllers/role.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const roleRoutes = Router();

roleRoutes.post('/', authMiddleware, createRole);
roleRoutes.get('/', authMiddleware, getRoles);
roleRoutes.get('/:id', authMiddleware, getRoleById);
roleRoutes.put('/:id', authMiddleware, updateRole);
roleRoutes.delete('/:id', authMiddleware, deleteRole);

export { roleRoutes };
