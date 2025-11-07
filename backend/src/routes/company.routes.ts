import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middlewares.js';
import { RbacMiddleware } from '../middlewares/rbac.middlewares.js';

const router = Router();
const companyController = new CompanyController()
const authMiddleware = new AuthMiddleware();
const rbacMiddleware = new RbacMiddleware();

router.post('/', [authMiddleware.auth, rbacMiddleware.checkRole(['superadmin'])], companyController.create);
router.get('/', [authMiddleware.auth, rbacMiddleware.checkRole(['superadmin', 'admin'])], companyController.getAll);
router.get('/:id', [authMiddleware.auth, rbacMiddleware.checkRole(['superadmin', 'admin'])], companyController.getById);
router.put('/:id', [authMiddleware.auth, rbacMiddleware.checkRole(['superadmin'])], companyController.update);
router.delete('/:id', [authMiddleware.auth, rbacMiddleware.checkRole(['superadmin'])], companyController.delete);

export default router;
