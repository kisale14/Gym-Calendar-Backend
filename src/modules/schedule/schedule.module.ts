import { Module } from '@nestjs/common';
import { LessonsModule } from './lessons/lessons.module.js';
import { LessonsInstructorsModule } from './lessons-instructors/lessons-instructors.module.js';
import { LessonsCategoriesModule } from './lessons-categories/lessons-categories.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { WaitingListModule } from './waiting-list/waiting-list.module.js';
import { AttendanceModule } from './attendance/attendance.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';

@Module({
  imports: [
    LessonsModule,
    LessonsInstructorsModule,
    LessonsCategoriesModule,
    SchedulesModule,
    BookingsModule,
    WaitingListModule,
    AttendanceModule,
    NotificationsModule,
  ],
  exports: [],
})
export class ScheduleModule {}
