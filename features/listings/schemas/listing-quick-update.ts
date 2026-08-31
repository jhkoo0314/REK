import { z } from "zod";

export const listingQuickUpdateSchema = z.object({
  id: z.string().uuid(),
  listingStatus: z.enum(["vacant", "contract_in_progress", "contract_complete", "on_hold"]),
  holdingSource: z.string().trim(),
});

export type ListingQuickUpdateInput = z.input<typeof listingQuickUpdateSchema>;
