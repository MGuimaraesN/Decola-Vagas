import type { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';
import bcrypt from 'bcrypt';

export class AdminController {

    async createUser(req: Request, res: Response) {
    try {
        const { firstName, lastName, email, password, institutionId, roleId } = req.body;
        
        if (!email || !password || !institutionId) {
          return res.status(400).json(
            {error: 'Email, senha e instituição são obrigatórios'}
        )};

        const hashedPassword = await bcrypt.hash(password, 10);
        const ipUser = req.ip || 'IP não disponível';
        
        const userExist = await prisma.user.findUnique({
          where: {email: email}
        });
        
        if (userExist) {
          return res.status(409).json(
            {error: 'Email já cadastrado'}
          )};

        const newUser = await prisma.user.create({
          data: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            ip: ipUser
          }});

        await prisma.userInstitutionRole.create({
          data: {
            userId: newUser.id,
            institutionId,
            roleId,
          },
        });

        res.status(201).json(newUser);
      } catch (error) {
        console.error ('Erro ao registrar usuário:', error);
        return res.status(500).json({'Erro ao registrar usuário:': error});
      }
    }

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
      res.status(500).json({'Erro ao buscar estatísticas.': error});
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
      res.status(500).json({'Erro ao buscar usuários.': error});
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
      res.status(500).json({'Erro ao buscar detalhes do usuário.': error});
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
      res.status(500).json({'Erro ao atribuir cargo ao usuário.': error});
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
      res.status(500).json({'Erro ao remover cargo do usuário.': error});
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
      res.status(500).json({'Erro ao deletar usuário.': error});
    }
  }
}
