-- P1 follow-up: a customer phone is sufficient to register a consultation.
-- Status: written only. Apply manually to Supabase Dev after 20260826001100.

alter table public.consultations
  alter column customer_name drop not null;

alter table public.consultations
  drop constraint if exists consultations_customer_name_check;

comment on column public.consultations.customer_name is 'Optional customer name or internal identifier. Customer phone remains required for follow-up work.';
