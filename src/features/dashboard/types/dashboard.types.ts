export interface DashboardKPIs {
  totalClients: number;
  activeContracts: number;
  assetsUnderManagement: number;
  anniversariesNext30Days: number;
  openTasks: number;
}

export interface UpcomingAnniversary {
  id: string; // Contract ID or Anniversary ID depending on backend
  clientName: string;
  contractType: string;
  anniversaryDate: string; // ISO date string
  value: number; // AUM or contract value
  status: "Review" | "Pending" | "Completed" | string;
}

export interface PendingTask {
  id: string;
  title: string;
  clientName: string;
  dueDate: string; // ISO date string
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Done" | string;
}

export interface RecentActivity {
  id: string;
  action: string;
  entityName: string; // e.g., Client Name or Contract Name
  entityType: string;
  userName: string; // who performed it
  createdAt: string; // ISO date string
}

export interface DashboardClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  contractsCount: number;
  totalAUM: number;
  status: "Active" | "Inactive" | string;
  lastContact: string; // ISO date string
}

export interface DashboardSummaryResponse {
  kpis: DashboardKPIs;
  upcomingAnniversaries: UpcomingAnniversary[];
  pendingTasks: PendingTask[];
  recentActivity: RecentActivity[];
  clients: DashboardClient[];
}
