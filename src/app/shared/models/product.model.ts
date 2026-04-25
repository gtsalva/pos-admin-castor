export interface Product {
  product_id: string;
  sku: string;
  name: string;
  description: string | null;
  unit_price: number;
  stock: number;
  min_stock: number;
  is_active: boolean;
  category_id: string | null;
  category: { category_id: string; name: string } | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  unit_price: number;
  stock: number;
  min_stock?: number;
  category_id?: string;
}
