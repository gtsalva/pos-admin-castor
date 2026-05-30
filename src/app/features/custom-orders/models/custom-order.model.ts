export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'VISACUOTAS';

export type CustomOrderStatus =
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'IN_PRODUCTION'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CustomOrderItem {
  custom_order_item_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  cost_price: number | null;
  notes: string | null;
  subtotal: number;
}

export interface CustomOrderPayment {
  custom_order_payment_id: string;
  payment_method: PaymentMethod;
  amount: number;
  payment_reference: string | null;
  notes: string | null;
  received_by: { user_id: string; full_name: string };
  created_at: string;
}

export interface CustomOrder {
  custom_order_id: string;
  order_number: string;
  status: CustomOrderStatus;
  salesperson: { user_id: string; full_name: string };
  client: { client_id: string; full_name: string; nit: string | null } | null;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  notes: string | null;
  client_notes: string | null;
  delivery_date: string | null;
  agreed_price: number | null;
  total: number;
  total_paid: number;
  counts_for_incentive: boolean;
  custom_commission: number | null;
  supplier: { supplier_id: string; name: string } | null;
  linked_purchase_order_id: string | null;
  items: CustomOrderItem[];
  payments: CustomOrderPayment[];
  commission_payments: CustomOrderCommissionPayment[];
  print_receipts:      CustomOrderPrintReceipt[];
  created_at: string;
  updated_at: string;
}

export interface CustomOrderQuery {
  page?: number;
  limit?: number;
  status?: CustomOrderStatus;
  salesperson_id?: string;
  from_date?: string;
  to_date?: string;
}

export interface CreateCustomOrderItemPayload {
  description: string;
  quantity: number;
  unit_price: number;
  cost_price?: number;
  notes?: string;
}

export interface CreateCustomOrderPayload {
  client_id?: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  notes?: string;
  client_notes?: string;
  supplier_id?: string;
  items: CreateCustomOrderItemPayload[];
}

export interface CustomOrderCommissionPayment {
  commission_payment_id: string;
  amount: number;
  notes: string | null;
  paid_by: { user_id: string; full_name: string };
  created_at: string;
}

export interface CustomOrderPrintReceipt {
  print_receipt_id: string;
  printed_by:       { user_id: string; full_name: string };
  pdf_url:          string | null;
  created_at:       string;
}

export interface RegisterPaymentPayload {
  payment_method: PaymentMethod;
  amount: number;
  payment_reference?: string;
  notes?: string;
}

export interface RegisterCommissionPaymentPayload {
  amount: number;
  notes?: string;
}
