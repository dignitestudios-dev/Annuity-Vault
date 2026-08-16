export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
export type TaskStatus = "To do" | "In progress" | "Done";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  client?: {
    _id: string;
    firstName: string;
    lastName: string;
    name: string;
  };
  createdBy: string;
  createdByType: string;
  createdAt: string;
  updatedAt: string;

  // for convenience on frontend if id is mapped
  id?: string;
}

export interface TasksResponse {
  success: boolean;
  message: string;
  data: Task[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface TaskResponse {
  success: boolean;
  message: string;
  data: Task;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedTo: string;
  client?: string;
}

export type UpdateTaskDTO = Partial<CreateTaskDTO>;

export interface TasksQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  client?: string;
}
