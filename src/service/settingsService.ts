import { supabase } from "../utils/supabaseClient";

export async function deleteCatalog() {
  const { error } = await supabase.rpc("delete_all_articles");

  if (error) {
    console.error("❌ deleteCatalog error:", error);
    throw error;
  }
}
