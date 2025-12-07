import { Request, Response } from 'express';
import { createMinistrySchema, updateMinistrySchema } from '../schemas/ministry.schema';
import { logger } from '../utils/logger';
import prisma from '../lib/prisma';

export const createMinistry = async (req: Request, res: Response) => {
  try {
    const data = createMinistrySchema.parse(req.body);
    
    const ministry = await prisma.ministry.create({
      data
    });

    res.status(201).json(ministry);
  } catch (error: any) {
    logger.error('Error creating ministry:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ministry with this name already exists' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMinistries = async (req: Request, res: Response) => {
  try {
    const ministries = await prisma.ministry.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(ministries);
  } catch (error) {
    logger.error('Error fetching ministries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMinistryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ministry = await prisma.ministry.findUnique({
      where: { id },
      include: {
        members: true
      }
    });

    if (!ministry) {
      return res.status(404).json({ error: 'Ministry not found' });
    }

    res.json(ministry);
  } catch (error) {
    logger.error('Error fetching ministry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateMinistry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateMinistrySchema.parse(req.body);

    const ministry = await prisma.ministry.update({
      where: { id },
      data
    });

    res.json(ministry);
  } catch (error: any) {
    logger.error('Error updating ministry:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }
    if (error.code === 'P2025') {
       return res.status(404).json({ error: 'Ministry not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ministry with this name already exists' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteMinistry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.ministry.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error: any) {
    logger.error('Error deleting ministry:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Ministry not found' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
