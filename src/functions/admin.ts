import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { assertAdmin, getSupabaseAdmin } from "@/lib/supabase.server";

const tokenSchema = z.object({ accessToken: z.string().nullable() });

export const listAdmins = createServerFn({ method: "POST" })
  .validator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.accessToken);
    const db = getSupabaseAdmin();
    const { data: roles, error } = await db
      .from("user_roles")
      .select("user_id, created_at")
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    const admins = await Promise.all(
      (roles ?? []).map(async (role) => {
        const { data: user } = await db.auth.admin.getUserById(role.user_id);
        return {
          userId: role.user_id as string,
          email: user.user?.email ?? "(unknown)",
          since: role.created_at as string,
        };
      }),
    );
    return admins;
  });

async function findUserByEmail(email: string) {
  const db = getSupabaseAdmin();
  const target = email.trim().toLowerCase();
  const { data: profile } = await db
    .from("profiles")
    .select("id")
    .ilike("email", target)
    .maybeSingle();
  if (profile) return profile.id as string;
  // Fallback: scan auth users (small shops only have a few pages).
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const match = data.users.find((user) => user.email?.toLowerCase() === target);
    if (match) return match.id;
    if (data.users.length < 200) break;
  }
  return null;
}

export const grantAdmin = createServerFn({ method: "POST" })
  .validator((input: unknown) => tokenSchema.extend({ email: z.string().email() }).parse(input))
  .handler(async ({ data }) => {
    await assertAdmin(data.accessToken);
    const userId = await findUserByEmail(data.email);
    if (!userId) throw new Error("No account with that email. Ask them to sign up at /auth first.");
    const { error } = await getSupabaseAdmin()
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const revokeAdmin = createServerFn({ method: "POST" })
  .validator((input: unknown) => tokenSchema.extend({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const me = await assertAdmin(data.accessToken);
    if (me.id === data.userId) throw new Error("You can't remove your own admin access.");
    const { error } = await getSupabaseAdmin()
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
