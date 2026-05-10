export interface CsvUploadResultResponse {
  createdCount: number;
  errors: { rowNumber: number; email: string; reason: string }[];
}

export interface AuditLogResponse {
  id: number;
  adminEmail: string;
  action: string;
  entity: string;
  entityId: number;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface SeedResult {
  created: number;
  updated: number;
  skipped: number;
}
