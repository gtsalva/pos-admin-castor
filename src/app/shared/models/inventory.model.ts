export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface InventoryItem {
  product_id: string;
  sku: string;
  name: string;
  image_url: string | null;
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

export interface InventorySummary {
  total_cost_value: number;
  total_sale_value: number;
  low_stock_count: number;
}

export interface AdjustStockPayload {
  product_id: string;
  movement_type: MovementType;
  quantity: number;
  notes?: string;
  supplier_id?: string;
}
