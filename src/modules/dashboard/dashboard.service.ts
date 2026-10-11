import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async getDashboardData(fromStr?: string, toStr?: string) {
    const today = new Date();

    // Default to last 7 days if not provided
    let fromDate = new Date(today);
    fromDate.setDate(today.getDate() - 6);
    let toDate = new Date(today);

    if (fromStr) {
      fromDate = new Date(fromStr);
    }
    if (toStr) {
      toDate = new Date(toStr);
    }

    const from = fromDate.toISOString().split('T')[0];
    const to = toDate.toISOString().split('T')[0];

    // Scheduled Classes (Summary)
    const scheduledRes = await this.db.query(
      `SELECT COUNT(*)::int as count FROM scheduling.schedules WHERE event_date BETWEEN $1 AND $2`,
      [from, to],
    );
    const scheduledClasses = scheduledRes.rows[0]?.count || 0;

    // Registered Users
    const usersRes = await this.db.query(
      `SELECT COUNT(*)::int as count FROM seguridad.users`,
    );
    const registeredUsers = usersRes.rows[0]?.count || 0;

    // Completed Workouts & Attendance Rate
    const attendanceRes = await this.db.query(
      `SELECT 
         COUNT(a.id)::int as attended,
         COUNT(b.id)::int as booked
       FROM scheduling.schedules s
       LEFT JOIN scheduling.bookings b ON b.schedule_id = s.id
       LEFT JOIN scheduling.attendance a ON a.schedule_id = s.id AND a.user_id = b.user_id
       WHERE s.event_date BETWEEN $1 AND $2`,
      [from, to],
    );
    const completedWorkouts = attendanceRes.rows[0]?.attended || 0;
    const totalBooked = attendanceRes.rows[0]?.booked || 0;
    const attendanceRate =
      totalBooked > 0 ? Math.round((completedWorkouts / totalBooked) * 100) : 0;

    // Available Classes
    const availableRes = await this.db.query(
      `SELECT l.id, l.name as title, l.description, l.max_students as "maxCapacity",
        (SELECT json_agg(u.name || ' ' || u.lastname) 
         FROM scheduling.lessons_instructors li 
         JOIN seguridad.users u ON u.id = li.instructor_id 
         WHERE li.lesson_id = l.id) as instructors,
        (SELECT json_agg(c.name) 
         FROM scheduling.lessons_categories lc 
         JOIN shared.categories c ON c.id = lc.category_id 
         WHERE lc.lesson_id = l.id) as categories,
        (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'color', c.color, 'icon', c.icon)) 
         FROM scheduling.lessons_categories lc 
         JOIN shared.categories c ON c.id = lc.category_id 
         WHERE lc.lesson_id = l.id) as "categoryDetails"
       FROM scheduling.lessons l
       WHERE l.is_deleted = false
       LIMIT 10`,
    );
    const availableClasses = availableRes.rows.map((row) => ({
      ...row,
      instructors: row.instructors || [],
      categories: row.categories || [],
      categoryDetails: row.categoryDetails || [],
    }));

    // Upcoming Classes
    const upcomingRes = await this.db.query(
      `SELECT s.id, l.name as title, 
          to_char(s.event_date + s.start_time, 'YYYY-MM-DD"T"HH24:MI:SS') as start, 
          to_char(s.event_date + s.end_time, 'YYYY-MM-DD"T"HH24:MI:SS') as end,
          (SELECT array_agg(u.name || ' ' || u.lastname) FROM scheduling.lessons_instructors li JOIN seguridad.users u ON u.id = li.instructor_id WHERE li.lesson_id = l.id) as instructors
       FROM scheduling.schedules s
       JOIN scheduling.lessons l ON l.id = s.lesson_id
       WHERE s.event_date BETWEEN $1 AND $2
       GROUP BY s.id, l.name, l.id, s.event_date, s.start_time, s.end_time
       ORDER BY s.event_date, s.start_time
       LIMIT 10`,
      [from, to],
    );
    const upcomingClasses = upcomingRes.rows.map((row) => ({
      ...row,
      instructors: row.instructors || [],
    }));

    // Top Instructors
    const topInstRes = await this.db.query(
      `SELECT u.id, u.name || ' ' || u.lastname as name, COUNT(s.id)::int as "classCount"
       FROM seguridad.users u
       JOIN scheduling.lessons_instructors li ON li.instructor_id = u.id
       JOIN scheduling.schedules s ON s.lesson_id = li.lesson_id
       WHERE s.event_date BETWEEN $1 AND $2
       GROUP BY u.id, u.name, u.lastname
       ORDER BY "classCount" DESC
       LIMIT 5`,
      [from, to],
    );
    const topInstructors = topInstRes.rows;

    // Top Searched Categories
    const topCatRes = await this.db.query(
      `SELECT c.name as category, COUNT(s.id)::int as searches
       FROM shared.categories c
       JOIN scheduling.lessons_categories lc ON lc.category_id = c.id
       JOIN scheduling.schedules s ON s.lesson_id = lc.lesson_id
       WHERE s.event_date BETWEEN $1 AND $2
       GROUP BY c.id, c.name
       ORDER BY searches DESC
       LIMIT 5`,
      [from, to],
    );
    const topSearchedCategories = topCatRes.rows;

    // Weekly Class Counts
    const weeklyRes = await this.db.query(
      `SELECT 
         extract(isodow from s.event_date) as dow,
         COUNT(s.id)::int as classes
       FROM scheduling.schedules s
       WHERE s.event_date BETWEEN $1 AND $2
       GROUP BY dow`,
      [from, to],
    );

    const daysMap: Record<string, string> = {
      1: 'Lun',
      2: 'Mar',
      3: 'Mié',
      4: 'Jue',
      5: 'Vie',
      6: 'Sáb',
      7: 'Dom',
    };
    const dowCounts: Record<string, number> = {};
    weeklyRes.rows.forEach((r) => {
      dowCounts[r.dow.toString()] = r.classes;
    });
    const weeklyClassCounts = Object.keys(daysMap).map((key) => ({
      day: daysMap[key],
      classes: dowCounts[key] || 0,
    }));

    // Recent Class Attendance
    const recentAttRes = await this.db.query(
      `SELECT s.id, l.name as name,
          COUNT(a.id)::int as attendees,
          (COUNT(b.id) - COUNT(a.id))::int as absentees
       FROM scheduling.schedules s
       JOIN scheduling.lessons l ON l.id = s.lesson_id
       LEFT JOIN scheduling.bookings b ON b.schedule_id = s.id
       LEFT JOIN scheduling.attendance a ON a.schedule_id = s.id AND a.user_id = b.user_id
       WHERE s.event_date <= $1
       GROUP BY s.id, l.name, s.event_date, s.start_time
       ORDER BY s.event_date DESC, s.start_time DESC
       LIMIT 5`,
      [to],
    );
    const recentClassAttendance = recentAttRes.rows.map((row) => ({
      name: row.name,
      attendees: row.attendees,
      absentees: row.absentees < 0 ? 0 : row.absentees,
    }));

    return {
      data: {
        period: {
          from,
          to,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        summary: {
          scheduledClasses,
          attendanceRate,
          registeredUsers,
          completedWorkouts,
          trends: {
            scheduledClasses: { value: 0, direction: 'up' },
            attendance: { value: 0, direction: 'up' },
            users: { value: 0, direction: 'up' },
            completedWorkouts: { value: 0, direction: 'up' },
          },
        },
        availableClasses,
        upcomingClasses,
        topInstructors,
        topSearchedCategories,
        weeklyClassCounts,
        recentClassAttendance,
      },
    };
  }
}
