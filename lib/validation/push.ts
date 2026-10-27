import { z } from "zod";

export const pushEndpointSchema = z.string().url().max(4096);
export const pushSubscriptionSchema = z.object({
  endpoint: pushEndpointSchema,
  p256dh: z.string().min(1),
  auth: z.string().min(1),
});
