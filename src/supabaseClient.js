import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dacpsesqngfdfbshilbl.supabase.co";

const supabaseKey = "sb_publishable_LDMCPo8uZ8Uii-8s7RgNcg_JGkQYcbV";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);