import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const { setCookie, cookies } = vi.hoisted(() => {
  const setCookie = vi.fn();
  return { setCookie, cookies: vi.fn(async () => ({ set: setCookie })) };
});
vi.mock("next/headers", () => ({ cookies }));
import { setLocaleAction } from "@/app/actions/locale";

describe("locale action boundary", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllEnvs());

  it.each([null, undefined, "fr", "HE", {}, { locale: "he" }, "he;path=/"])(
    "rejects invalid input %j without touching cookies",
    async (input) => {
      expect(await setLocaleAction(input)).toEqual({ ok: false });
      expect(cookies).not.toHaveBeenCalled();
    },
  );

  it.each(["en", "he"])(
    "persists the validated %s preference for a year",
    async (locale) => {
      vi.stubEnv("NODE_ENV", "development");
      expect(await setLocaleAction(locale)).toEqual({ ok: true });
      expect(setCookie).toHaveBeenCalledWith("pointsy_locale", locale, {
        maxAge: 31536000,
        path: "/",
        sameSite: "lax",
        secure: false,
        httpOnly: true,
      });
    },
  );

  it("requires HTTPS for production cookies", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await setLocaleAction("he");
    expect(setCookie).toHaveBeenCalledWith(
      "pointsy_locale",
      "he",
      expect.objectContaining({ secure: true }),
    );
  });
});
