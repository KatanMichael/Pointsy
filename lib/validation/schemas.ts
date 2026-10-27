import { z } from "zod";
import { isIconKey } from "@/lib/icons";

/**
 * Zod schemas validate every server-action boundary (SPEC §3 security
 * invariants). Keep messages kid/parent-friendly — they may surface in UI.
 */

export const localeSchema = z.enum(["en", "he"]);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("errors.validation.enter.a.valid.email.address");

export const passwordSchema = z
  .string()
  .min(8, "errors.validation.use.at.least.8.characters")
  .max(200);

export const pinSchema = z
  .string()
  .regex(/^\d{4}$/, "errors.validation.pin.must.be.exactly.4.digits");

export const personNameSchema = z
  .string()
  .trim()
  .min(1, "errors.validation.name.is.required")
  .max(40);

export const emojiSchema = z.string().trim().min(1).max(8);
export const iconSchema = z
  .string()
  .refine(isIconKey, "errors.validation.pick.an.icon");
export const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "errors.validation.use.a.hex.color.like.6366f1");

/** A "HH:MM" 24h time, or "" → null (an unset window bound). */
export const hhmmSchema = z
  .union([
    z.literal(""),
    z
      .string()
      .regex(
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "errors.validation.enter.a.valid.time",
      ),
  ])
  .default("")
  .transform((v) => (v === "" ? null : v));

/* ----------------------------------------------------------------- auth */

export const signUpSchema = z.object({
  familyName: z
    .string()
    .trim()
    .min(1, "errors.validation.family.name.is.required")
    .max(60),
  parentName: personNameSchema,
  email: emailSchema,
  password: passwordSchema,
  consent: z
    .boolean()
    .refine(
      (v) => v === true,
      "errors.validation.parental.consent.is.required.to.continue",
    ),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "errors.validation.enter.your.password"),
});

export const inviteCodeSchema = z
  .string()
  .trim()
  .min(4, "errors.validation.enter.your.invite.code")
  .max(40, "errors.validation.that.doesn.t.look.like.a.valid.invite.code");

/** A co-parent redeeming an invite code by creating their own login. */
export const joinFamilySchema = z.object({
  code: inviteCodeSchema,
  name: personNameSchema,
  email: emailSchema,
  password: passwordSchema,
  consent: z
    .boolean()
    .refine(
      (v) => v === true,
      "errors.validation.parental.consent.is.required.to.continue",
    ),
});

export const kidSignInSchema = z.object({
  familyId: z.string().uuid(),
  personId: z.string().uuid(),
  pin: pinSchema,
});

export const familyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^[A-Z0-9]+-[A-Z0-9]+$/,
    "errors.validation.enter.a.valid.family.code",
  );

/* --------------------------------------------------------------- people */

export const addKidSchema = z.object({
  name: personNameSchema,
  avatar: iconSchema,
  color: colorSchema,
  pin: pinSchema,
});

export const updateKidSchema = z.object({
  name: personNameSchema,
  avatar: iconSchema,
  color: colorSchema,
});

/* -------------------------------------------------------------- catalog */

/** A custom chore category: a short name and an icon-registry key. */
export const categorySchema = z.object({
  name: z.string().trim().min(1, "errors.validation.name.is.required").max(40),
  icon: iconSchema,
});

export const choreSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "errors.validation.name.is.required")
      .max(60),
    emoji: iconSchema,
    points: z.coerce
      .number()
      .int("errors.validation.points.must.be.a.whole.number")
      .min(0)
      .max(100000),
    /** The family category this chore belongs to; ownership re-checked server-side. */
    categoryId: z.string().uuid("errors.validation.pick.a.category").optional(),
    description: z.string().trim().max(280).optional(),
    /** A "core" chore expected daily (drives challenges). */
    isCore: z.coerce.boolean().default(false),
    /** Who the chore is for; assignees/rotation order in `kidIds`. */
    assignment: z
      .enum(["everyone", "specific", "rotating"])
      .default("everyone"),
    kidIds: z.array(z.string().uuid()).default([]),
    /** Ordered checklist; blanks are dropped server-side. */
    subtasks: z.array(z.string().trim().max(80)).max(20).default([]),
    /** How often a kid may claim it. "none" = unlimited; count applies otherwise. */
    limitPeriod: z.enum(["none", "day", "week"]).default("none"),
    limitCount: z.coerce
      .number()
      .int("errors.validation.enter.a.whole.number")
      .min(1, "errors.validation.must.be.at.least.1")
      .max(50, "errors.validation.that.s.a.lot.keep.it.50.or.under")
      .default(1),
    /** Whether the limit is per kid or a shared family-wide total. */
    limitScope: z.enum(["per_kid", "total"]).default("per_kid"),
    /**
     * Logging window — when a kid may self-log this chore. Days come in as the
     * selected weekday indices (Mon=0…Sun=6); 0 or all 7 means "every day" (null
     * mask). Times are "HH:MM" or "" (no bound, → null).
     */
    logWindowDays: z
      .array(z.coerce.number().int().min(0).max(6))
      .default([])
      .transform((days) => {
        const set = new Set(days);
        if (set.size === 0 || set.size === 7) return null;
        let mask = 0;
        for (const d of set) mask |= 1 << d;
        return mask;
      }),
    logWindowStart: hhmmSchema,
    logWindowEnd: hhmmSchema,
  })
  .superRefine((val, ctx) => {
    if (val.logWindowStart && val.logWindowEnd) {
      const toMin = (s: string) => {
        const [h, m] = s.split(":").map(Number);
        return h * 60 + m;
      };
      if (toMin(val.logWindowEnd) <= toMin(val.logWindowStart)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["logWindowEnd"],
          message: "errors.validation.close.time.must.be.after.open.time",
        });
      }
    }
  });

export const rewardSchema = z.object({
  name: z.string().trim().min(1, "errors.validation.name.is.required").max(60),
  emoji: iconSchema,
  cost: z.coerce
    .number()
    .int("errors.validation.cost.must.be.a.whole.number")
    .min(0)
    .max(100000),
  description: z.string().trim().max(280).optional(),
  /** A team reward is redeemed by several kids splitting the cost. */
  isTeam: z.coerce.boolean().default(false),
  minKids: z.coerce
    .number()
    .int("errors.validation.enter.a.whole.number")
    .min(2, "errors.validation.a.team.needs.at.least.2.kids")
    .max(10, "errors.validation.keep.it.to.10.or.fewer")
    .default(2),
  /** For team rewards: also redeemable solo at full cost. */
  allowSolo: z.coerce.boolean().default(false),
  /**
   * Optional: a kid this reward is just for. Empty string ("Everyone") becomes
   * undefined; ownership is re-checked server-side.
   */
  assignedToKidId: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
});

/* --------------------------------------------------------------- challenges */

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "errors.validation.pick.a.date");

export const challengeSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "errors.validation.name.is.required")
      .max(80),
    description: z.string().trim().max(280).optional(),
    scope: z.enum(["kid", "family"]).default("kid"),
    recurrence: z.enum(["none", "weekly"]).default("none"),
    /** Checked ⇒ the bonus waits for a parent to confirm (auto-award otherwise). */
    needsApproval: z.coerce.boolean().default(false),
    goalType: z.enum(["points", "chore_count", "core_days"]),
    goalTarget: z.coerce
      .number()
      .int("errors.validation.target.must.be.a.whole.number")
      .min(1, "errors.validation.set.a.target.of.at.least.1")
      .max(100000),
    bonusPoints: z.coerce
      .number()
      .int("errors.validation.bonus.must.be.a.whole.number")
      .min(1, "errors.validation.bonus.must.be.at.least.1")
      .max(100000),
    startsOn: isoDateSchema,
    /** Optional: blank is allowed (and means "no end") for weekly challenges. */
    endsOn: z
      .union([isoDateSchema, z.literal("")])
      .optional()
      .transform((v) => (v ? v : undefined)),
    /** Participating kids; empty ⇒ the whole family. */
    kidIds: z.array(z.string().uuid()).default([]),
  })
  .superRefine((d, ctx) => {
    // A one-off challenge must have an end date; weekly may run indefinitely.
    if (d.recurrence !== "weekly" && !d.endsOn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "errors.validation.pick.an.end.date",
        path: ["endsOn"],
      });
    }
    if (d.endsOn && d.endsOn < d.startsOn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "errors.validation.the.end.date.must.be.on.or.after.the.start",
        path: ["endsOn"],
      });
    }
  });

/* ---------------------------------------------------- points & redemptions */

/**
 * Award or deduct a custom amount. `direction` decides the sign — the amount
 * itself is always entered as a positive number, so the UI never asks a parent
 * to type a minus sign.
 */
export const changePointsSchema = z.object({
  // One or more recipients: the kid whose screen this is, plus any "also give
  // to" picks (issue #159).
  kidIds: z
    .array(z.string().uuid())
    .min(1, "errors.validation.pick.at.least.one.child")
    .transform((ids) => Array.from(new Set(ids))),
  direction: z.enum(["award", "deduct"]),
  amount: z.coerce
    .number()
    .int("errors.validation.use.a.whole.number")
    .min(1, "errors.validation.enter.a.positive.amount")
    .max(100000),
  reason: z.string().trim().min(1, "errors.validation.add.a.reason").max(140),
});

export const awardChoresSchema = z.object({
  kidId: z.string().uuid(),
  choreIds: z
    .array(z.string().uuid())
    .min(1, "errors.validation.pick.at.least.one.chore"),
});

export const requestRedemptionSchema = z.object({
  rewardId: z.string().uuid(),
});

export const decideRedemptionSchema = z.object({
  redemptionId: z.string().uuid(),
  decision: z.enum(["approved", "denied"]),
  note: z.string().trim().max(280).optional(),
});

/** Put back an earned ledger entry from the activity feed. */
export const undoEarnSchema = z.object({
  entryId: z.string().uuid(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type AddKidInput = z.infer<typeof addKidSchema>;
export type ChoreInput = z.infer<typeof choreSchema>;
export type RewardInput = z.infer<typeof rewardSchema>;
