import { Request, Response } from 'express';
import { createMemberSchema, updateMemberSchema } from '../schemas/member.schema';
import { logger } from '../utils/logger';
import prisma from '../lib/prisma';

export const createMember = async (req: Request, res: Response) => {
  try {
    const { ministryIds, ...memberData } = createMemberSchema.parse(req.body);
    
    const member = await prisma.member.create({
      data: {
        ...memberData,
        ministries: ministryIds ? {
          connect: ministryIds.map(id => ({ id }))
        } : undefined,
      }
    });

    res.status(201).json(member);
  } catch (error: any) {
    logger.error('Error creating member:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const members = await prisma.member.findMany({
      include: {
        ministries: true,
        cellGroup: true,
        family: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(members);
  } catch (error) {
    logger.error('Error fetching members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMemberById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        ministries: true,
        cellGroup: true,
        family: true
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    logger.error('Error fetching member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ministryIds, ...memberData } = updateMemberSchema.parse(req.body);

    const member = await prisma.member.update({
      where: { id },
      data: {
        ...memberData,
        ministries: ministryIds ? {
          set: ministryIds.map(id => ({ id }))
        } : undefined,
      }
    });

    res.json(member);
  } catch (error: any) {
    logger.error('Error updating member:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }
    if (error.code === 'P2025') {
       return res.status(404).json({ error: 'Member not found' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.member.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error: any) {
    logger.error('Error deleting member:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
