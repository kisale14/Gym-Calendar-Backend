export class Schedule {
  id: string;
  lesson_id: string;
  instructor_id: string;
  event_date: string; // O Date, según cómo maneje PostgreSQL el tipo DATE
  start_time: string;
  end_time: string;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
  created_by?: string;
  updated_by?: string;
  version: number;
  created_at: Date;
  updated_at: Date;
}