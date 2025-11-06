import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, logoUrl, websiteUrl, description } = req.body;
    const company = await prisma.company.create({
      data: { name, logoUrl, websiteUrl, description },
    });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the company.' });
  }
};

export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching companies.' });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id: Number(id) },
    });
    if (!company) {
      return res.status(404).json({ error: 'Company not found.' });
    }
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the company.' });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, logoUrl, websiteUrl, description } = req.body;
    const company = await prisma.company.update({
      where: { id: Number(id) },
      data: { name, logoUrl, websiteUrl, description },
    });
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the company.' });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.company.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the company.' });
  }
};
