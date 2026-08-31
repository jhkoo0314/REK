-- 중개수수료 정산 금액을 만원 단위에서 원 단위로 전환한다.
update public.contract_revenue_settlements set agreed_commission_amount = agreed_commission_amount * 10000, tenant_commission_amount = tenant_commission_amount * 10000, landlord_commission_amount = landlord_commission_amount * 10000;
update public.contract_revenue_entries set gross_amount = gross_amount * 10000, external_co_broker_share_amount = external_co_broker_share_amount * 10000, office_share_amount = office_share_amount * 10000, staff_share_amount = staff_share_amount * 10000;
