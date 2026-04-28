export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface InventoryItem {
  product_id: string;
  sku: string;
  name: string;
  stock: number;
  min_stock: number;
  unit_price: number;
  category: { category_id: string; name: string } | null;
}

export interface InventoryMovement {
  movement_id: string;
  movement_type: MovementType;
  quantity: number;
  notes: string | null;
  reference_id: string | null;
  supplier_id: string | null;
  supplier: { supplier_id: string; name: string } | null;
  created_at: string;
  user: { user_id: string; full_name: string };
}

export interface AdjustStockPayload {
  product_id: string;
  movement_type: MovementType;
  quantity: number;
  notes?: string;
  supplier_id?: string;
}
