import { Router } from 'express';
import { createInstitution, getInstitutions, getInstitutionById, updateInstitution, deleteInstitution } from '../controllers/institution.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const institutionRoutes = Router();

institutionRoutes.post('/', authMiddleware, createInstitution);
institutionRoutes.get('/', authMiddleware, getInstitutions);
institutionRoutes.get('/:id', authMiddleware, getInstitutionById);
institutionRoutes.put('/:id', authMiddleware, updateInstitution);
institutionRoutes.delete('/:id', authMiddleware, deleteInstitution);

export { institutionRoutes };
