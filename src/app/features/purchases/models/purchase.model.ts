export type PurchaseStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  purchase_item_id: string;
  product_id: string;
  product_sku: string;
  product_name: string;
  quantity_ordered: number;
  quantity_received: number | null;
  unit_cost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  purchase_order_id: string;
  order_number: string;
  supplier_id: string;
  supplier: { supplier_id: string; name: string } | null;
  status: PurchaseStatus;
  items: PurchaseOrderItem[];
  total_cost: number;
  notes: string | null;
  cancellation_reason: string | null;
  ordered_by_user: { user_id: string; name: string } | null;
  received_by_user: { user_id: string; name: string } | null;
  received_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseQuery {
  page?: number;
  limit?: number;
  status?: PurchaseStatus;
  supplier_id?: string;
}

export interface CreatePurchasePayload {
  supplier_id: string;
  notes?: string;
  items: {
    product_id: string;
    quantity_ordered: number;
    unit_cost: number;
  }[];
}

export interface ReceivePurchasePayload {
  items: {
    purchase_item_id: string;
    quantity_received: number;
  }[];
}
