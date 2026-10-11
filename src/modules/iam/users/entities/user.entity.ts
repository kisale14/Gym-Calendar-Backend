export class User {
  id: string;
  name: string;
  lastname: string;
  date_birth: Date;
  email: string;
  username: string;
  password_hash?: string;
  gender_name?: string;
  image?: string | null;
  phone?: string | null;
  gender_id: string;
  is_deleted: boolean;
  deleted_at?: Date | null;
  deleted_by?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  version: number;
  created_at: Date;
  updated_at: Date;
  current_refresh_token?: string | null;
}
