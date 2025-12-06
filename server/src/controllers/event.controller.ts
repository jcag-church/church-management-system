import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { createEventSchema, updateEventSchema, registerForEventSchema, updateRegistrationSchema } from '../schemas/event.schema';
import { AppError } from '../middleware/error.middleware';

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'asc' },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            member: true,
          },
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createEventSchema.parse(req.body);
    const event = await prisma.event.create({
      data,
    });
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateEventSchema.parse(req.body);
    const event = await prisma.event.update({
      where: { id },
      data,
    });
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await prisma.$transaction([
      prisma.eventRegistration.deleteMany({
        where: { eventId: id },
      }),
      prisma.attendance.deleteMany({
        where: { eventId: id },
      }),
      prisma.event.delete({
        where: { id },
      }),
    ]);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const registerForEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = registerForEventSchema.parse(req.body);

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: id,
        ...data,
      },
    });

    res.status(201).json(registration);
  } catch (error) {
    next(error);
  }
};

export const updateRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, registrationId } = req.params;
    const data = updateRegistrationSchema.parse(req.body);

    const registration = await prisma.eventRegistration.update({
      where: { id: registrationId },
      data,
    });

    res.json(registration);
  } catch (error) {
    next(error);
  }
};

export const deleteRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, registrationId } = req.params;
    await prisma.eventRegistration.delete({
      where: { id: registrationId },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
