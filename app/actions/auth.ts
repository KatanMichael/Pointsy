"use server";

import { getRequestLocale } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { createSession, destroySession } from "@/lib/auth/session";
import { rememberFamily } from "@/lib/auth/device";
import {
  registerFamily,
  authenticateParent,
  EmailTakenError,
} from "@/lib/auth/register";
import { signUpSchema, signInSchema } from "@/lib/validation/schemas";
import { toFieldErrors } from "@/lib/validation/form";

export type AuthState = import("@/lib/validation/form").FormState;

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    familyName: formData.get("familyName"),
    parentName: formData.get("parentName"),
    email: formData.get("email"),
    password: formData.get("password"),
    consent: formData.get("consent") === "on",
  });
  if (!parsed.success) return { fieldErrorCodes: toFieldErrors(parsed.error) };

  try {
    const tz = formData.get("timezone");
    const result = await registerFamily(getDb(), {
      ...parsed.data,
      locale: await getRequestLocale(),
      timezone: typeof tz === "string" ? tz : undefined,
    });
    await createSession({
      familyId: result.familyId,
      personId: result.personId,
      role: "parent",
    });
    await rememberFamily(result.familyId);
  } catch (err) {
    if (err instanceof EmailTakenError) {
      return { fieldErrorCodes: { email: { key: "errors.emailTaken" } } };
    }
    throw err;
  }

  // Outside try/catch: redirect() throws a control-flow signal by design.
  redirect("/dashboard");
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { fieldErrorCodes: toFieldErrors(parsed.error) };

  const parent = await authenticateParent(
    getDb(),
    parsed.data.email,
    parsed.data.password,
  );
  if (!parent) return { errorCode: { key: "errors.invalidCredentials" } };

  await createSession({
    familyId: parent.familyId,
    personId: parent.id,
    role: "parent",
  });
  await rememberFamily(parent.familyId);
  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
