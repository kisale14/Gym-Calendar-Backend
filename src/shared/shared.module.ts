import { Global, Module } from '@nestjs/common';
import { GenderModule } from './gender/gender.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { StatusesModule } from './statuses/statuses.module.js';
import { BookingStatusesModule } from './booking-statuses/booking-statuses.module.js';
import { WaitingStatusesModule } from './waiting-statuses/waiting-statuses.module.js';
import { AttendanceStatusesModule } from './attendance-statuses/attendance-statuses.module.js';
import { AuditLogModule } from './audit_log/audit_log.module.js';

@Global()
@Module({
  imports: [
    GenderModule,
    CategoriesModule,
    StatusesModule,
    BookingStatusesModule,
    WaitingStatusesModule,
    AttendanceStatusesModule,
    AuditLogModule,
  ],
  exports: [
    GenderModule,
    CategoriesModule
  ],
})
export class SharedModule {}