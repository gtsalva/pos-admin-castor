export type ReportPeriod = 'day' | 'week' | 'month';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export interface TopSellerRow {
  salesperson_id: string;
  salesperson_name: string;
  total_sales: number;
  total_revenue: number;
  avg_sale_value: number;
}

export interface TopProductRow {
  product_id: string;
  product_name: string;
  product_sku: string;
  category_id: string | null;
  category_name: string | null;
  units_sold: number;
  total_revenue: number;
}

export interface ProductMarginRow {
  product_id: string;
  product_name: string;
  product_sku: string;
  category_name: string | null;
  cost_price: number | null;
  sale_price: number;
  margin_amount: number | null;
  margin_pct: number | null;
  units_sold: number;
  total_revenue: number;
}

export interface RevenueTrendPoint {
  period: string;
  revenue: number;
  sales_count: number;
}

export interface RevenueByPaymentMethod {
  payment_method: PaymentMethod;
  revenue: number;
  sales_count: number;
}

export interface RevenueByCategory {
  category_id: string | null;
  category_name: string | null;
  revenue: number;
  units_sold: number;
}

export interface RevenueReport {
  trend: RevenueTrendPoint[];
  by_payment_method: RevenueByPaymentMethod[];
  by_category: RevenueByCategory[];
  totals: {
    total_revenue: number;
    total_sales: number;
    avg_ticket: number;
  };
}

export interface TopSellersFilters {
  date_from?: string;
  date_to?: string;
  limit?: number;
}

export interface TopProductsFilters {
  date_from?: string;
  date_to?: string;
  category_id?: string;
  limit?: number;
}

export interface ProductMarginsFilters {
  date_from?: string;
  date_to?: string;
  category_id?: string;
  min_margin_pct?: number;
}

export interface RevenueFilters {
  date_from?: string;
  date_to?: string;
  period?: ReportPeriod;
  payment_method?: PaymentMethod;
  salesperson_id?: string;
  category_id?: string;
}
