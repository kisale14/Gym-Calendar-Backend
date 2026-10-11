export class WaitingList {
  id: string;
  schedule_id: string;
  user_id: string;
  waiting_status_id: string;
  position: number;
  notified_at?: Date;
  confirmation_deadline_at?: Date;
  confirmed_at?: Date;
  declined_at?: Date;
  cancelled_at?: Date;
  converted_at?: Date;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
  version: number;
}
