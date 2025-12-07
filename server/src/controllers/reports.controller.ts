import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { startOfYear, endOfYear, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, format } from 'date-fns';

export const getAttendanceMetrics = async (req: Request, res: Response) => {
  try {
    const { eventId, period = 'year', year = new Date().getFullYear().toString() } = req.query;

    const selectedYear = parseInt(year as string);
    const startDate = startOfYear(new Date(selectedYear, 0, 1));
    const endDate = endOfYear(new Date(selectedYear, 0, 1));

    const where: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: 'ATTENDED', // Only count actual attendance
    };

    if (eventId && eventId !== 'all') {
      where.eventId = eventId as string;
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where,
      select: {
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Aggregation Logic
    const totalAttendance = attendanceRecords.length;
    
    // Calculate average per session
    // We need to know how many unique sessions (event + date) occurred
    const uniqueSessions = new Set(attendanceRecords.map((r: { date: Date }) => r.date.toISOString().split('T')[0])).size;
    const averageAttendance = uniqueSessions > 0 ? Math.round(totalAttendance / uniqueSessions) : 0;

    // Chart Data Aggregation
    let chartData: { label: string; count: number }[] = [];

    if (period === 'year') {
      // Group by Month
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(selectedYear, i, 1);
        return format(d, 'MMM');
      });
      
      const counts = new Array(12).fill(0);
      attendanceRecords.forEach((record: { date: Date }) => {
        const monthIndex = record.date.getMonth();
        counts[monthIndex]++;
      });

      chartData = months.map((label, i) => ({ label, count: counts[i] }));

    } else if (period === 'quarter') {
      // Group by Quarter (Q1, Q2, Q3, Q4)
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      const counts = new Array(4).fill(0);

      attendanceRecords.forEach((record: { date: Date }) => {
        const month = record.date.getMonth();
        const quarterIndex = Math.floor(month / 3);
        counts[quarterIndex]++;
      });

      chartData = quarters.map((label, i) => ({ label, count: counts[i] }));
    }

    res.json({
      totalAttendance,
      averageAttendance,
      chartData,
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
