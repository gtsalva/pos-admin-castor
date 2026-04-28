export interface IncentivePeriod {
  period_id: string;
  name: string;
  start_date: string;
  end_date: string;
  goal_amount: number;
  commission_rate: number;
  is_active: boolean;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalespersonPerformance {
  salesperson_id: string;
  full_name: string;
  email: string;
  amount_sold: number;
  transaction_count: number;
  commission_earned: number;
  goal_pct: number;
  is_liquidated: boolean;
  liquidated_at: string | null;
}

export interface PeriodPerformance {
  period: IncentivePeriod;
  performance: SalespersonPerformance[];
}

export interface CreatePeriodPayload {
  name: string;
  start_date: string;
  end_date: string;
  goal_amount: number;
  commission_rate: number;
  is_active?: boolean;
}

export type UpdatePeriodPayload = Partial<CreatePeriodPayload>;
