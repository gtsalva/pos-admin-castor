export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'SALESPERSON';

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  role?: UserRole;
}
