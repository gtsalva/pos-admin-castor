export interface Category {
  category_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  is_active?: boolean;
}
