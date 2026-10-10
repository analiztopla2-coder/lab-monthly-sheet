export interface LabParameter {
  id: string;
  name: string;
  sortOrder: number;
}

export interface LabParameterRow {
  id: string;
  name: string;
  name_normalized: string;
  sort_order: number;
  effective_from: string;
  effective_to: string | null;
  deleted_at: string | null;
}
