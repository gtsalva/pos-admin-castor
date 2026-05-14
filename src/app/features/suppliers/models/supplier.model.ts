export interface Supplier {
  supplier_id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierPayload {
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateSupplierPayload extends Partial<CreateSupplierPayload> {
  is_active?: boolean;
}

export interface SupplierQuery {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}
