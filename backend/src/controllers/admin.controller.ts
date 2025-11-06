import type { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';

export class AdminController {

  async getStats(req: Request, res: Response) {
    try {
      const userCount = await prisma.user.count();
      const institutionCount = await prisma.institution.count();
      const jobCount = await prisma.job.count();

      res.json({
        userCount,
        institutionCount,
        jobCount,
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
    }
  }
  
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        include: {
          institutions: {
            include: {
              institution: true,
              role: true,
            },
          },
        },
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
  }

  async getUserDetails(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(req.params.id) },
        include: {
          institutions: {
            include: {
              institution: true,
              role: true,
            },
          },
        },
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar detalhes do usuário.' });
    }
  }

  async assignRoleToUser(req: Request, res: Response) {
    try {
      const { userId, institutionId, roleId } = req.body;
      const userInstitutionRole = await prisma.userInstitutionRole.create({
        data: {
          userId,
          institutionId,
          roleId,
        },
      });
      res.json(userInstitutionRole);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atribuir cargo ao usuário.' });
    }
  }

  async removeRoleFromUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.userInstitutionRole.delete({
        where: { id: Number(id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao remover cargo do usuário.' });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.user.delete({
        where: { id: Number(id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar usuário.' });
    }
  }
}
