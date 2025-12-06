import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { SessionRequest } from 'supertokens-node/framework/express';

export const getCellGroups = async (req: SessionRequest, res: Response) => {
  try {
    const cellGroups = await prisma.cellGroup.findMany({
      orderBy: { name: 'asc' },
      include: {
        leader: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });
    res.json(cellGroups);
  } catch (error) {
    console.error('Error fetching cell groups:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCellGroup = async (req: SessionRequest, res: Response) => {
  try {
    const { name, leaderId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const cellGroup = await prisma.cellGroup.create({
      data: { 
        name,
        leaderId: leaderId || null,
      },
    });

    res.status(201).json(cellGroup);
  } catch (error) {
    console.error('Error creating cell group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCellGroup = async (req: SessionRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, leaderId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const cellGroup = await prisma.cellGroup.update({
      where: { id },
      data: { 
        name,
        leaderId: leaderId || null,
      },
    });

    res.json(cellGroup);
  } catch (error) {
    console.error('Error updating cell group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCellGroup = async (req: SessionRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.cellGroup.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting cell group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
