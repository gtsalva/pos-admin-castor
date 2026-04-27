export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';
export type SaleStatus = 'COMPLETED' | 'VOIDED';

export interface SaleItem {
  sale_item_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  sale_id: string;
  sale_number: string;
  payment_method: PaymentMethod;
  status: SaleStatus;
  void_reason: string | null;
  total: number;
  created_at: string;
  client: { client_id: string; full_name: string; nit: string | null } | null;
  salesperson: { user_id: string; full_name: string };
  items: SaleItem[];
}

export interface SaleQuery {
  page?: number;
  limit?: number;
  from_date?: string;
  to_date?: string;
  payment_method?: PaymentMethod;
  status?: SaleStatus;
}
