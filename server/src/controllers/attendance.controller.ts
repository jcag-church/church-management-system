import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { CheckInInput } from '../schemas/attendance.schema';

export const checkIn = async (req: Request<{}, {}, CheckInInput>, res: Response) => {
  try {
    const { eventId, memberId, date } = req.body;

    // Check if attendance already exists
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        eventId,
        memberId,
        date: new Date(date),
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Member already checked in for this event on this date' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        eventId,
        memberId,
        date: new Date(date),
        status: 'ATTENDED',
      },
      include: {
        member: true,
        event: true,
      },
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const undoCheckIn = async (req: Request<{}, {}, CheckInInput>, res: Response) => {
  try {
    const { eventId, memberId, date } = req.body;

    // Find the attendance record
    const attendance = await prisma.attendance.findFirst({
      where: {
        eventId,
        memberId,
        date: new Date(date),
      },
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await prisma.attendance.delete({
      where: { id: attendance.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error undoing check-in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAttendance = async (req: Request, res: Response) => {
  try {
    const { eventId, date } = req.query;

    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const where: any = { eventId };
    if (date && typeof date === 'string') {
      // Filter by date (ignoring time if needed, but for now exact match or range might be better)
      // Let's assume date is passed as an ISO string for the start of the day
      const searchDate = new Date(date);
      // Ensure we search for the whole day if needed, or exact match if the frontend sends exact time
      // For check-in, we store exact time from frontend? No, schema says DateTime.
      // If we store exact time, equality check might fail if not precise.
      // But checkIn uses `new Date(date)` from body.
      // Let's assume for now we want all attendance for that "logical" date.
      // But `checkIn` stores the specific timestamp sent.
      // If the frontend sends the same timestamp for `getAttendance`, we can match.
      // But usually `getAttendance` is for a day.
      
      // For simplicity in this iteration, let's match exact date if provided, or range.
      // The previous implementation used range. Let's stick to that or improve.
      // Actually, let's just return all for the event if date is not strict, or filter by day.
      
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        member: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAttendanceSummary = async (req: Request, res: Response) => {
  try {
    const summary = await prisma.attendance.groupBy({
      by: ['eventId', 'date'],
      _count: {
        memberId: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    const eventIds = [...new Set(summary.map(s => s.eventId))];
    const events = await prisma.event.findMany({
      where: { id: { in: eventIds } },
      select: { id: true, name: true },
    });

    const eventMap = new Map(events.map(e => [e.id, e.name]));

    const result = summary.map(s => ({
      eventId: s.eventId,
      eventName: eventMap.get(s.eventId) || 'Unknown Event',
      date: s.date,
      count: s._count.memberId,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAttendanceDates = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.query;

    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const dates = await prisma.attendance.findMany({
      where: { eventId },
      select: { date: true },
      distinct: ['date'],
      orderBy: { date: 'desc' },
    });

    res.json(dates.map(d => d.date));
  } catch (error) {
    console.error('Error fetching attendance dates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
