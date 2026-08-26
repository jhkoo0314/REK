-- P0 follow-up: additional residential room-type choices for listing registration.
-- Status: written only. Apply to Supabase Dev manually after the initial P0 schema.

alter type public.property_type add value if not exists 'two_bay';
alter type public.property_type add value if not exists 'three_room';
alter type public.property_type add value if not exists 'owner_unit';
