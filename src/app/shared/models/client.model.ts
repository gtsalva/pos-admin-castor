export interface Client {
  client_id: string;
  nit: string | null;
  dpi: string | null;
  full_name: string;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  billing_address: string | null;
  is_active: boolean;
}
