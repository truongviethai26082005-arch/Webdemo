"use server";

import { createClient } from "@/lib/supabase/server";
import { CenterBankSettings, DEFAULT_CENTER_BANK_SETTINGS } from "@/lib/utils/vietqr";

export async function getCenterBankSettings(): Promise<CenterBankSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("center_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_CENTER_BANK_SETTINGS;
    }

    return {
      bank_id: data.bank_id || DEFAULT_CENTER_BANK_SETTINGS.bank_id,
      bank_account_no: data.bank_account_no || DEFAULT_CENTER_BANK_SETTINGS.bank_account_no,
      bank_account_name: data.bank_account_name || DEFAULT_CENTER_BANK_SETTINGS.bank_account_name,
      bank_name: data.bank_name || (data.bank_id === "TCB" ? "Techcombank (TCB)" : data.bank_id),
    };
  } catch (err) {
    console.error("Error in getCenterBankSettings:", err);
    return DEFAULT_CENTER_BANK_SETTINGS;
  }
}
