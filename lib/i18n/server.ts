import "server-only";
import { cookies, headers } from "next/headers";
import { resolveLocale, type Locale } from "./locale";

/** Request APIs make the root layout dynamic; never cache a visitor's locale globally. */
export async function getRequestLocale(): Promise<Locale> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  return resolveLocale(
    cookieStore.get("pointsy_locale")?.value,
    headerStore.get("accept-language"),
  );
}
