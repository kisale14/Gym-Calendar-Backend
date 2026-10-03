export class Notification {
  id: string;
  user_id: string;
  schedule_id: string;
  waiting_list_id?: string;
  type: string;
  subject: string;
  message: string;
  sent_at: Date;
  read_at?: Date;
  is_deleted: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}