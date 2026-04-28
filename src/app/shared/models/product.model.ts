import { ProductResource } from './product-resource.model';

export interface Product {
  product_id: string;
  sku: string;
  name: string;
  description: string | null;
  unit_price: number;
  cost_price: number | null;
  min_sale_price: number | null;
  stock: number;
  min_stock: number;
  is_active: boolean;
  category_id: string | null;
  category: { category_id: string; name: string } | null;
  image_url: string | null;
  resources?: ProductResource[];
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  unit_price: number;
  cost_price?: number;
  min_sale_price?: number;
  stock: number;
  min_stock?: number;
  category_id?: string;
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  description?: string;
  unit_price?: number;
  cost_price?: number;
  min_sale_price?: number;
  min_stock?: number;
  category_id?: string;
  is_active?: boolean;
}
