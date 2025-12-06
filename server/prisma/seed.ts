import 'dotenv/config';
import { PrismaClient, EventType, MemberStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia', 'William', 'Ava', 'Joseph', 'Sophia', 'Charles', 'Isabella', 'Thomas', 'Mia', 'Daniel', 'Charlotte'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('Start seeding ...');

  // 1. Create Members
  let members = await prisma.member.findMany();
  if (members.length < 30) {
    const countToCreate = 30 - members.length;
    console.log(`Creating ${countToCreate} new members...`);
    for (let i = 0; i < countToCreate; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const member = await prisma.member.create({
        data: {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Date.now()}${i}@example.com`,
          phone: `555-01${i.toString().padStart(2, '0')}`,
          address: `${Math.floor(Math.random() * 1000)} Main St`,
          status: MemberStatus.ACTIVE,
          dob: getRandomDate(new Date('1970-01-01'), new Date('2000-01-01')),
        },
      });
      members.push(member);
      console.log(`Created member with id: ${member.id}`);
    }
  } else {
    console.log(`Found ${members.length} existing members. Skipping creation.`);
  }

  // 2. Create Events
  let sundayService = await prisma.event.findFirst({ where: { name: 'Sunday Service' } });
  if (!sundayService) {
    sundayService = await prisma.event.create({
      data: {
        name: 'Sunday Service',
        type: EventType.SERVICE,
        isRecurring: true,
        dayOfWeek: 0, // Sunday
        startTime: '09:00',
        description: 'Weekly Sunday Worship Service',
      },
    });
    console.log(`Created event: ${sundayService.name}`);
  } else {
    console.log(`Event ${sundayService.name} already exists.`);
  }

  let prayerMeeting = await prisma.event.findFirst({ where: { name: 'Prayer Meeting' } });
  if (!prayerMeeting) {
    prayerMeeting = await prisma.event.create({
      data: {
        name: 'Prayer Meeting',
        type: EventType.PRAYER_MEETING,
        isRecurring: true,
        dayOfWeek: 3, // Wednesday
        startTime: '19:00',
        description: 'Weekly Wednesday Prayer Meeting',
      },
    });
    console.log(`Created event: ${prayerMeeting.name}`);
  } else {
    console.log(`Event ${prayerMeeting.name} already exists.`);
  }

  // 3. Create Attendance
  // Generate attendance for the last 4 weeks
  const events = [sundayService, prayerMeeting];
  const today = new Date();
  
  for (const event of events) {
    // Find occurrences in the last 4 weeks
    for (let i = 0; i < 4; i++) {
      const targetDay = event.dayOfWeek!;
      const date = new Date(today);
      // Calculate date for this week's occurrence, then subtract i weeks
      const currentDay = date.getDay();
      const diff = date.getDate() - currentDay + (currentDay < targetDay ? targetDay - 7 : targetDay);
      date.setDate(diff - (i * 7));
      
      // Skip future dates
      if (date > today) continue;

      // Check if attendance already exists for this event and date (sample check)
      const existingAttendanceCount = await prisma.attendance.count({
        where: {
          eventId: event.id,
          date: date,
        }
      });

      if (existingAttendanceCount > 0) {
        console.log(`Attendance for ${event.name} on ${date.toISOString().split('T')[0]} already exists (${existingAttendanceCount} records). Skipping.`);
        continue;
      }

      // Randomly assign 60-80% of members to attend
      let createdCount = 0;
      for (const member of members) {
        if (Math.random() > 0.3) { // 70% chance to attend
          await prisma.attendance.create({
            data: {
              eventId: event.id,
              memberId: member.id,
              date: date,
              status: 'ATTENDED',
            },
          });
          createdCount++;
        }
      }
      console.log(`Created ${createdCount} attendance records for ${event.name} on ${date.toISOString().split('T')[0]}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
