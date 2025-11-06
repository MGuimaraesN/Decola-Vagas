import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Salvar uma vaga
export const saveJob = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { jobId } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated.' });
  }

  try {
    const savedJob = await prisma.savedJob.create({
      data: {
        userId: userId,
        jobId: Number(jobId),
      },
    });
    res.status(201).json(savedJob);
  } catch (error: any) {
    if (error.code === 'P2002') { // Unique constraint violation
      return res.status(409).json({ error: 'Job already saved.' });
    }
    res.status(500).json({ error: 'An error occurred while saving the job.' });
  }
};

// Desfazer o salvamento de uma vaga
export const unsaveJob = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { jobId } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated.' });
  }

  try {
    await prisma.savedJob.delete({
      where: {
        userId_jobId: {
          userId: userId,
          jobId: Number(jobId),
        },
      },
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') { // Record to delete not found
        return res.status(404).json({ error: 'Saved job not found.' });
    }
    res.status(500).json({ error: 'An error occurred while unsaving the job.' });
  }
};

// Obter todas as vagas salvas por um usuário
export const getMySavedJobs = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated.' });
  }

  try {
    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: userId },
      include: {
        job: {
          include: {
            area: true,
            category: true,
            company: true,
            institution: {
                select: { name: true }
            }
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.status(200).json(savedJobs.map(sj => sj.job));
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching saved jobs.' });
  }
};

// Obter apenas os IDs das vagas salvas
export const getMySavedJobIds = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    try {
      const savedJobs = await prisma.savedJob.findMany({
        where: { userId: userId },
        select: {
          jobId: true,
        },
      });
      res.status(200).json(savedJobs.map(sj => sj.jobId));
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching saved job IDs.' });
    }
}
