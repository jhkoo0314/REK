export type ListingStatus = "vacant" | "contract_in_progress" | "contract_complete" | "on_hold" | "ended";
export type TransactionType = "monthly_rent" | "jeonse" | "sale" | "to_be_confirmed";
export type PhotoStatus = "not_available" | "available" | "needs_confirmation";
export type AvailabilityType = "immediate" | "date_specified" | "needs_confirmation";
export type ListingEndReason = "other_broker_contract" | "other";

export type ListingListItem = {
  id: string;
  referenceNumber: number;
  propertyType: "one_room" | "two_room" | "two_bay" | "three_room" | "owner_unit" | "apartment" | "officetel" | "retail" | "office";
  status: ListingStatus;
  transactionType: TransactionType;
  buildingName: string;
  address: string;
  unitNumber: string;
  layoutType: string | null;
  depositAmount: number | null;
  monthlyRentAmount: number | null;
  maintenanceFeeAmount: number | null;
  availableDate: string | null;
  availabilityType: AvailabilityType;
  holdingSource: string | null;
  photoStatus: PhotoStatus;
  lastConfirmedDate: string | null;
};

export type ListingFilters = {
  query: string;
  status: ListingStatus | "all" | "active";
  transaction: TransactionType | "all";
  availability: AvailabilityType | "all";
  minDeposit: string;
  maxDeposit: string;
  holdingSource: string;
  photo: PhotoStatus | "all";
  confirmedBefore: string;
};

export type ListingDetail = ListingListItem & {
  unitId: string;
  buildingId: string;
  roadAddress: string | null;
  lotAddress: string | null;
  addressDetail: string | null;
  floor: number | null;
  direction: string | null;
  options: string[];
  moveOutDate: string | null;
  endReason: ListingEndReason | null;
};

export type ListingEditData = { listing: ListingDetail; accessPassword: string; ownerPhone: string; tenantPhone: string; sensitiveAccess: { propertyContacts: boolean; unitAccess: boolean } };
