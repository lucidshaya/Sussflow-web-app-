import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function serverEnv(name: string): string {
  const value = process.env[name] ?? (import.meta.env[name] as string | undefined);
  if (!value) throw new Error(`Missing server environment variable ${name}. See .env.example.`);
  return value;
}

let admin: SupabaseClient | undefined;

/** Service-role client — bypasses RLS. Only import from server functions. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!admin) {
    admin = createClient(serverEnv("VITE_SUPABASE_URL"), serverEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}

/** Resolve the user behind a Supabase access token (sent from the browser). */
export async function getUserFromToken(token: string | undefined | null) {
  if (!token) return null;
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error) return null;
  return data.user;
}

export async function assertAdmin(token: string | undefined | null) {
  const user = await getUserFromToken(token);
  if (!user) throw new Error("Not signed in");
  const { data } = await getSupabaseAdmin()
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Admin access required");
  return user;
}
