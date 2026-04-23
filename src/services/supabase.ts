import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Export the Next.js App Router compatible client 
// so all legacy API services instantly work natively.
export const supabase = createSupabaseBrowserClient();
