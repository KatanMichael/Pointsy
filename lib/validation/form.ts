import type { UiError } from "@/lib/i18n/errors";
export { validationErrors as toFieldErrors } from "@/lib/i18n/errors";

/** Shared shape for server-action form results consumed via useActionState. */
export interface FormState {
  errorCode?: UiError;
  fieldErrorCodes?: Record<string, UiError>;
  ok?: boolean;
  /** Echoes which way a points change went, so the UI can confirm it precisely. */
  direction?: "award" | "deduct";
  /** Who a points change landed for, so the UI can name them back. */
  kidIds?: string[];
}
