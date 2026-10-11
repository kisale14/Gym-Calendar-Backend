export class Attendance {
  id: string;
  schedule_id: string;
  user_id: string;
  attendance_status_id: string;
  attended_at?: Date;
  notes?: string;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
  version: number;
}
