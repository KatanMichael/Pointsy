import { describe, expect, it } from "vitest";
import { translate } from "@/lib/i18n";
import {
  presentError,
  validationErrors,
  expectedError,
} from "@/lib/i18n/errors";
import { signUpSchema } from "@/lib/validation/schemas";
import { InsufficientPointsError } from "@/lib/redemptions/service";

describe("render-time coded errors", () => {
  it("changes an already-presented error when locale changes", () => {
    const error = { key: "errors.invalidCredentials" } as const;
    expect(presentError("he", error)).toBe("הפרטים שהוזנו שגויים.");
    expect(presentError("en", error)).toBe("Incorrect email or password.");
  });
  it("never exposes an internal exception", () => {
    expect(
      presentError("he", expectedError(new Error("postgres password secret"))),
    ).toBe(translate("he", "errors.generic"));
    expect(
      presentError("he", expectedError(new InsufficientPointsError())),
    ).toBe("אין מספיק נקודות למימוש הפרס.");
  });
  it("codes explicit and default schema errors by field", () => {
    const result = signUpSchema.safeParse({
      familyName: "",
      parentName: 7,
      email: "bad",
      password: "x",
      consent: false,
    });
    if (result.success) throw new Error("invalid fixture passed");
    const errors = validationErrors(result.error);
    expect(presentError("he", errors.email)).toBe(
      "יש להזין כתובת דוא״ל תקינה.",
    );
    expect(presentError("he", errors.password)).toBe(
      "יש להשתמש בלפחות 8 תווים.",
    );
    expect(presentError("he", errors.parentName)).toBe("יש להזין ערך תקין.");
  });
});
