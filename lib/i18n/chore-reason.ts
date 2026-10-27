import { translate, type Locale, type MessageKey } from "./index";
export interface ChoreReason {
  key: Extract<MessageKey, `domain.${string}`>;
  params?: Record<string, string | number>;
}
/** Presentation metadata is distinct from stored names and ledger reasons. */
export function choreReasonText(
  locale: Locale,
  reason?: ChoreReason | null,
): string | undefined {
  return reason
    ? (
        translate as (
          locale: Locale,
          key: MessageKey,
          params?: Record<string, string | number>,
        ) => string
      )(locale, reason.key, reason.params)
    : undefined;
}
