export interface ContractDocument {
  _id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  location: string;
  uploadedBy: string;
  uploadedByType: string;
  isArchived?: boolean;
  isDeleted?: boolean;
}

export interface ContractNote {
  _id: string;
  body: string;
  createdBy: string;
  createdByType: string;
  createdAt: string;
  isArchived?: boolean;
  isDeleted?: boolean;
}

export interface ContractClient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  name: string;
}

export interface Contract {
  id: string; // React query might map _id to id or just use _id
  _id: string;
  contractNumber: string;
  policyNumber?: string | null;
  client: ContractClient;
  provider: string;
  contractType: string;
  productName?: string | null;
  status: string;
  startDate?: string | null;
  anniversaryDate?: string | null;
  premiumAmount?: number | null;
  contractValue?: number | null;
  deathBenefit?: number | null;
  income?: number | null;
  incomeMode?: string | null;
  qualified?: boolean | null;
  rmd?: number | null;
  liquidityFeature?: number | null;
  outOfSurrenderDate?: string | null;
  penaltyFreeAmount?: number | null;
  marketValueAdjustment?: number | null;
  currentSurrenderValue?: number | null;
  ridersOrFeatures?: string | null;
  annuitantNotOwner?: boolean | null;
  annuitantDob?: string | null;
  beneficiaryInformation?: string | null;
  notes?: string | null;
  isArchived: boolean;
  archivedAt: string | null;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  
  documents?: ContractDocument[];
  contractNotes?: ContractNote[];
}

export interface GetContractsResponse {
  success: boolean;
  message: string;
  data: Contract[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface GetContractResponse {
  success: boolean;
  message: string;
  data: Contract;
}

export interface CreateContractDTO {
  client: string;
  provider: string;
  contractType: string;
  status?: string;
  policyNumber?: string | null;
  productName?: string | null;
  startDate?: string | null;
  anniversaryDate?: string | null;
  premiumAmount?: number | null;
  contractValue?: number | null;
  deathBenefit?: number | null;
  income?: number | null;
  incomeMode?: string | null;
  qualified?: boolean | null;
  rmd?: number | null;
  liquidityFeature?: number | null;
  outOfSurrenderDate?: string | null;
  penaltyFreeAmount?: number | null;
  marketValueAdjustment?: number | null;
  currentSurrenderValue?: number | null;
  ridersOrFeatures?: string | null;
  annuitantNotOwner?: boolean | null;
  annuitantDob?: string | null;
  beneficiaryInformation?: string | null;
  notes?: string | null;
}

export type UpdateContractDTO = Partial<CreateContractDTO>;

