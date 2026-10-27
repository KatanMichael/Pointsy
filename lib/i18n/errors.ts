import type { z } from "zod";
import {
  translate,
  type Locale,
  type MessageKey,
  type Translator,
} from "./index";
import { en } from "./messages";

export type ErrorKey = Extract<MessageKey, `errors.${string}`>;
export interface UiError {
  key: ErrorKey;
  params?: Record<string, string | number>;
}
/** Only dedicated, authored error codes cross the action boundary. */
export function presentError(
  locale: Locale,
  error?: UiError,
): string | undefined {
  return error
    ? (
        translate as (
          locale: Locale,
          key: MessageKey,
          params?: Record<string, string | number>,
        ) => string
      )(locale, error.key, error.params)
    : undefined;
}
export function errorText(t: Translator, error?: UiError): string | undefined {
  return error
    ? (
        t as (
          key: MessageKey,
          params?: Record<string, string | number>,
        ) => string
      )(error.key, error.params)
    : undefined;
}
export function expectedError(error: unknown): UiError {
  const keys: Record<string, ErrorKey> = {
    EmailTakenError: "errors.emailTaken",
    InviteInvalidError: "errors.inviteInvalid",
    NotOwnerError: "errors.ownerOnly",
    CannotRemoveParentError: "errors.cannotRemoveParent",
    InsufficientPointsError: "errors.insufficientPoints",
    DuplicateRequestError: "errors.duplicateRequest",
    TeamRewardError: "errors.team",
    NotEnoughKidsError: "errors.team",
    ShareUnaffordableError: "errors.insufficientPoints",
  };
  return {
    key:
      error instanceof Error
        ? (keys[error.name] ?? "errors.generic")
        : "errors.generic",
  };
}
export function validationErrors(error: z.ZodError): Record<string, UiError> {
  const result: Record<string, UiError> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    if (result[field]) continue;
    if (issue.message.startsWith("errors.") && issue.message in en)
      result[field] = { key: issue.message as ErrorKey };
    else if (issue.code === "too_small")
      result[field] = {
        key: "errors.minimum",
        params: { minimum: String(issue.minimum) },
      };
    else if (issue.code === "too_big")
      result[field] = {
        key: "errors.maximum",
        params: { maximum: String(issue.maximum) },
      };
    else result[field] = { key: "errors.invalid" };
  }
  return result;
}
export function translateFormState<
  T extends { errorCode?: UiError; fieldErrorCodes?: Record<string, UiError> },
>(
  state: T,
  t: Translator,
): T & { error?: string; fieldErrors?: Record<string, string> } {
  return {
    ...state,
    error: errorText(t, state.errorCode),
    fieldErrors: state.fieldErrorCodes
      ? Object.fromEntries(
          Object.entries(state.fieldErrorCodes).map(([key, value]) => [
            key,
            errorText(t, value)!,
          ]),
        )
      : undefined,
  };
}
