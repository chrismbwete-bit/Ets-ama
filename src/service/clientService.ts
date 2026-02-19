import { supabase } from "../utils/supabaseClient";

export async function registerClient(data: {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
}) {
  const { data: res, error } = await supabase
    .from("clients")
    .insert([
      {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        password: data.password,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("❌ registerClient error:", error);
    throw error;
  }

  return res;
}
