export interface AuditLog {
  audit_log_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  performed_by_id: string;
  performed_by_name: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}
