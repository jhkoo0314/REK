-- 약정 중개수수료를 임차인·임대인 수수료로 분리한다.

alter table public.contract_revenue_settlements add column if not exists tenant_commission_amount integer;
alter table public.contract_revenue_settlements add column if not exists landlord_commission_amount integer;

update public.contract_revenue_settlements
set tenant_commission_amount = agreed_commission_amount,
    landlord_commission_amount = 0
where tenant_commission_amount is null or landlord_commission_amount is null;

alter table public.contract_revenue_settlements alter column tenant_commission_amount set not null;
alter table public.contract_revenue_settlements alter column landlord_commission_amount set not null;
alter table public.contract_revenue_settlements add constraint contract_revenue_settlements_tenant_amount_check check (tenant_commission_amount >= 0);
alter table public.contract_revenue_settlements add constraint contract_revenue_settlements_landlord_amount_check check (landlord_commission_amount >= 0);
alter table public.contract_revenue_settlements add constraint contract_revenue_settlements_total_amount_check check (agreed_commission_amount = tenant_commission_amount + landlord_commission_amount);
