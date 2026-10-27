# Hebrew support — checkpoint (2026-10-27)

Paused at the user's request to resume after their usage allowance renews. This PR preserves the implemented work; it does not represent completion of the full [Hebrew support plan](superpowers/plans/2026-10-27-hebrew-support.md).

## Implemented

- Typed English/Hebrew catalogs, interpolation/plural handling, request locale negotiation and locale-aware formatting.
- One persistent language selector, matching server/client locale and HTML direction, and draft-discard protection including partial PINs and controlled forms.
- Core auth/profile/parent/kid screens, accessible labels, expected validation/action errors, dynamic chore/challenge summaries, and localized categories for new Hebrew families. Existing family content and ledger snapshots remain unchanged.
- Heebo typography, logical inline layout properties, navigation-arrow mirroring, LTR PIN/technical fields and stable brand direction.
- Hebrew notification controls and PWA installation guidance; shared bilingual manifest description.
- Additive push-subscription locale migration and owner-scoped updates/deletion. Semantic per-device notification formatting/delivery is implemented and tested, but existing application event callers still use their legacy English payloads.

## Remaining before full release

1. Complete the core translation review and address any findings. Integrated screenshots and mixed-script/negative-balance checks remain to be finished.
2. Translate public marketing pages, guides, comparisons, calculators, privacy/terms, root metadata and skip link. Shared public header/footer are already translated. Existing marketing screenshots still show English.
3. Convert notification event callers in `app/actions/{points,redemptions,submissions,team}.ts` to semantic `PushMessage` events, then remove the temporary legacy payload union in `lib/push/send.ts`.
4. Complete full unit/integration/E2E/build/Lighthouse verification, production-worker cold-start/cache checks and final visual review. Human review of Hebrew legal translations and real-device/VoiceOver checks remain release gates.
5. Update documentation/changeset to reflect the final scope and complete the final branch review.

## Validation already recorded

- Original baseline: 37 test files / 206 tests passed.
- Locale foundation: 31 focused tests; locale-action/core subset 30 tests; language-selection browser suite 24/24 across Mobile Chrome, Mobile Safari and Desktop Chrome.
- Core: focused integration checks 68 tests, points-engine/catalog 19 tests, helper checks 42 tests and the new Hebrew browser error scenario passed; these subsets overlap and must not be summed into a full-suite total. Typecheck and lint passed for that task.
- RTL + installation guidance: 9/9 browser cases including axe and 320px auth screens.
- Push unit/integration: 4 files / 16 tests passed, including ownership isolation and delivery in the receiving device's language. Negative controls confirmed the tests reject English-only delivery/guidance.
- Checkpoint verification: typecheck and 7 focused test files / 50 tests passed. Repository-wide `npm run lint` currently fails with an ESLint configuration error: `jsx-a11y/alt-text` references an unavailable plugin for a matched file; this is unresolved and must be checked on resume.
- This checkpoint has not run the final full E2E suite or production build. Actual remote push delivery was not tested with VAPID keys.

## Database / deployment

Migration `0022_push_subscription_locale.sql` was applied to a disposable local Postgres database only. Production was not modified or deployed. Existing Vercel production builds automatically run migrations; keep that step. A Preview must use a separately migrated database before exercising the new subscription queries.

## Resume

Continue from this branch/PR rather than redoing completed tasks. The complete implementation plan and `docs/i18n-coverage.md` map the remaining surfaces. Scratch task evidence lives in the local ignored `.superpowers/sdd/2026-10-27-hebrew-support/` directory. Do not treat previously passing subsets as a final full-suite pass.
