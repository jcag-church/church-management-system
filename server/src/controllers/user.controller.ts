import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { SessionRequest } from 'supertokens-node/framework/express';

export const getMe = async (req: SessionRequest, res: Response) => {
  try {
    const session = req.session;
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = session.getUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      // If user exists in SuperTokens but not in our DB, we might want to create them or return 404
      // For now, let's return 404
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUsers = async (req: SessionRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserRole = async (req: SessionRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['ADMIN', 'WORKER', 'VISITOR'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: SessionRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting self
    const currentUserId = req.session!.getUserId();
    if (id === currentUserId) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await prisma.user.delete({
      where: { id },
    });

    // Also delete from SuperTokens (optional but recommended)
    // For now, we just delete from our DB. SuperTokens user will remain but won't have a profile.
    // Ideally we should use SuperTokens SDK to delete the user there too.

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
