import { Router } from 'express';
import { Router } from 'express';
import { createCompany, getAllCompanies, getCompanyById, updateCompany, deleteCompany } from '../controllers/company.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';
import { RbacMiddleware } from '../middlewares/rbac.middlewares.js';

const router = Router();
const authMiddleware = new AuthMiddleware();
const rbacMiddleware = new RbacMiddleware();

router.post('/', [authMiddleware.auth, rbacMiddleware.checkRole(['superadmin'])], createCompany);
router.get('/', [authMiddleware.auth, rbacMiddleware.checkRole(['superadmin', 'admin'])], getAllCompanies);
router.get('/:id', [authMiddleware.auth, rbacMiddleware.checkRole(['superadmin', 'admin'])], getCompanyById);
router.put('/:id', [authMiddleware.auth, rbacMiddleware.checkRole(['superadmin'])], updateCompany);
router.delete('/:id', [authMiddleware.auth, rbacMiddleware.checkRole(['superadmin'])], deleteCompany);

export default router;
