import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { SessionRequest } from 'supertokens-node/framework/express';

export const getFamilies = async (req: SessionRequest, res: Response) => {
  try {
    const families = await prisma.family.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
    res.json(families);
  } catch (error) {
    console.error('Error fetching families:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createFamily = async (req: SessionRequest, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const family = await prisma.family.create({
      data: { name },
    });

    res.status(201).json(family);
  } catch (error) {
    console.error('Error creating family:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateFamily = async (req: SessionRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const family = await prisma.family.update({
      where: { id },
      data: { name },
    });

    res.json(family);
  } catch (error) {
    console.error('Error updating family:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteFamily = async (req: SessionRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.family.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting family:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
