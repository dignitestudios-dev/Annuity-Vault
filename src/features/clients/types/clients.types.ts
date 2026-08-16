export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string; // ISO string
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: "Active" | "Inactive" | "Prospect" | "Archived" | string;
  totalAUM: number;
  lastContact?: string; // ISO string
  createdAt: string;
  updatedAt: string;
  contractsCount?: number;
  notes?: string;
}

export type CreateClientDTO = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status?: string;
  notes?: string;
};

export type UpdateClientDTO = Partial<CreateClientDTO>;

export interface ClientsResponse {
  data: Client[];
  total: number;
  page: number;
  limit: number;
}
