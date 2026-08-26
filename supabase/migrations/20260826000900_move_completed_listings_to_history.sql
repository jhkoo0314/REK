-- Align existing Dev test data with the finalized P0 rule.
-- Apply manually to Supabase Dev only after reviewing the affected rows.
-- A contract-complete listing is no longer current inventory; it remains as
-- read-only unit history and frees the unit for a new current listing.

update public.listings
set is_current = false,
    updated_at = timezone('utc', now())
where listing_status = 'contract_complete'
  and is_current = true;
