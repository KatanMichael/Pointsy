"use server";

import { cookies } from "next/headers";
import { localeSchema } from "@/lib/validation/schemas";

export async function setLocaleAction(
  input: unknown,
): Promise<{ ok: boolean }> {
  const parsed = localeSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  (await cookies()).set("pointsy_locale", parsed.data, {
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  return { ok: true };
}
