import { z } from "zod";

export const listingRetireSchema = z.object({ id: z.string().uuid(), endReason: z.enum(["other_broker_contract", "other"]) });
export type ListingRetireInput = z.input<typeof listingRetireSchema>;
