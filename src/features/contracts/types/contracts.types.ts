export interface ContractDocument {
  _id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  location: string;
  uploadedBy: string;
  uploadedByType: string;
}

export interface ContractNote {
  _id: string;
  body: string;
  createdBy: string;
  createdByType: string;
  createdAt: string;
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
  policyNumber: string;
  client: ContractClient;
  provider: string;
  contractType: string;
  status: string;
  startDate: string;
  anniversaryDate: string;
  premiumAmount: number;
  contractValue: number;
  beneficiaryInformation?: string;
  notes?: string;
  isArchived: boolean;
  archivedAt: string | null;
  createdBy: string;
  createdAt?: string;
  
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
  policyNumber: string;
  provider: string;
  contractType: string;
  status: string;
  startDate?: string;
  anniversaryDate?: string;
  premiumAmount: number;
  contractValue: number;
  beneficiaryInformation?: string;
  notes?: string;
}

export type UpdateContractDTO = Partial<CreateContractDTO>;
