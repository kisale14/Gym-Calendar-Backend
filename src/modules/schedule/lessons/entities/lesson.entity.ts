export class Lesson {
  id: string;
  name: string;
  description?: string;
  max_students: number;
  pdf_url?: string;
  image_url?: string;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
  created_by?: string;
  updated_by?: string;
  version: number;
  created_at: Date;
  updated_at: Date;
}
