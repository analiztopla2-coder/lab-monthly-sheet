import { getSupabaseAdmin } from "./supabase-server";

export class ReorderStaleOrderError extends Error {
  constructor() {
    super("stale_order");
    this.name = "ReorderStaleOrderError";
  }
}

export class ReorderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReorderValidationError";
  }
}

export async function reorderLabParameters(
  expectedOrderIds: string[],
  orderedIds: string[]
): Promise<void> {
  const { error } = await getSupabaseAdmin().rpc("reorder_lab_parameters", {
    p_expected_ids: expectedOrderIds,
    p_ordered_ids: orderedIds,
  });

  if (!error) return;

  const msg = error.message || "";
  if (msg.includes("stale_order") || error.code === "40001") {
    throw new ReorderStaleOrderError();
  }
  if (
    msg.includes("invalid_order") ||
    error.code === "22000" ||
    error.code === "P0001"
  ) {
    throw new ReorderValidationError("Geçersiz sıralama isteği");
  }

  throw error;
}
