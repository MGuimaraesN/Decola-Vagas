import { Router } from 'express';
import { createCompany, getAllCompanies, getCompanyById, updateCompany, deleteCompany } from '../controllers/company.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/checkRole.middleware';

const router = Router();

router.post('/', [authMiddleware, checkRole(['superadmin'])], createCompany);
router.get('/', [authMiddleware, checkRole(['superadmin', 'admin'])], getAllCompanies);
router.get('/:id', [authMiddleware, checkRole(['superadmin', 'admin'])], getCompanyById);
router.put('/:id', [authMiddleware, checkRole(['superadmin'])], updateCompany);
router.delete('/:id', [authMiddleware, checkRole(['superadmin'])], deleteCompany);

export default router;
