export type ResourceType = 'image' | 'pdf';

export interface ProductResource {
  resource_id: string;
  product_id: string;
  url: string;
  resource_type: ResourceType;
  sort_order: number;
  created_at: string;
}
