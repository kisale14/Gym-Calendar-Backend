export class Booking {
  id: string;
  user_id: string;
  schedule_id: string;
  booking_status_id: string;
  booked_at: Date;
  confirmed_at?: Date;
  cancelled_at?: Date;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
  version: number;
}