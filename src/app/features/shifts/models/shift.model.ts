export type ShiftStatus = 'CLOSED' | 'REOPENED';

export interface ShiftClose {
  shift_close_id: string;
  salesperson_id: string;
  shift_date: string;
  status: ShiftStatus;
  total_sales: number;
  cash_total: number;
  card_total: number;
  transfer_total: number;
  transaction_count: number;
  closed_by_id: string;
  notes: string | null;
  reopened_at: string | null;
  reconciliation: Reconciliation | null;
  created_at: string;
}

export interface Reconciliation {
  reconciliation_id: string;
  shift_close_id: string;
  cash_expected: number;
  card_expected: number;
  transfer_expected: number;
  cash_counted: number;
  card_counted: number;
  transfer_counted: number;
  other_counted: number;
  cash_difference: number;
  card_difference: number;
  transfer_difference: number;
  notes: string | null;
  created_at: string;
}

export interface DailySummaryEntry {
  salesperson_id: string;
  salesperson_name: string | null;
  total_sales: number;
  transaction_count: number;
  cash_total: number;
  card_total: number;
  transfer_total: number;
  shift_close: ShiftClose | null;
  has_reconciliation: boolean;
}

export interface DailySummary {
  date: string;
  entries: DailySummaryEntry[];
}
