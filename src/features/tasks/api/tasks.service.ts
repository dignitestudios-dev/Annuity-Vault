import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { TasksQuery, TasksResponse, TaskResponse, Task, CreateTaskDTO, UpdateTaskDTO } from "../types/tasks.types";

export const tasksKeys = {
  all: ["tasks"] as const,
  lists: () => [...tasksKeys.all, "list"] as const,
  list: (filters: TasksQuery) => [...tasksKeys.lists(), filters] as const,
  details: () => [...tasksKeys.all, "detail"] as const,
  detail: (id: string) => [...tasksKeys.details(), id] as const,
};

const getTasks = async (params: TasksQuery): Promise<TasksResponse> => {
  const { data } = await axiosInstance.get<TasksResponse>("/tasks", {
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || undefined,
      status: params.status || undefined,
      priority: params.priority || undefined,
      assignedTo: params.assignedTo || undefined,
      client: params.client || undefined,
    },
  });
  return data;
};

const getTask = async (id: string): Promise<TaskResponse> => {
  const { data } = await axiosInstance.get<TaskResponse>(`/tasks/${id}`);
  return data;
};

const createTask = async (payload: CreateTaskDTO): Promise<TaskResponse> => {
  const { data } = await axiosInstance.post<TaskResponse>("/tasks", payload);
  return data;
};

const updateTask = async ({ id, data: payload }: { id: string; data: UpdateTaskDTO }): Promise<TaskResponse> => {
  const { data } = await axiosInstance.patch<TaskResponse>(`/tasks/${id}`, payload);
  return data;
};

const deleteTask = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/tasks/${id}`);
};

export const useTasks = (filters: TasksQuery = {}) => {
  return useQuery({
    queryKey: tasksKeys.list(filters),
    queryFn: () => getTasks(filters),
  });
};

export const useInfiniteTasks = (filters: Omit<TasksQuery, "page"> = {}) => {
  return useInfiniteQuery({
    queryKey: [...tasksKeys.list(filters), "infinite"],
    queryFn: ({ pageParam = 1 }) => getTasks({ ...filters, page: pageParam as number, limit: filters.limit || 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination || {};
      if (currentPage !== undefined && totalPages !== undefined && currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: tasksKeys.detail(id),
    queryFn: () => getTask(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.detail(variables.id) });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
    },
  });
};

export const exportTasks = async (format: "pdf" | "csv", search?: string, status?: string, priority?: string) => {
  const response = await axiosInstance.get<TasksResponse>("/tasks", {
    params: { search, status, priority, limit: 100 },
  });
  
  const tasks = response.data.data;
  
  if (format === "csv") {
    const headers = ["Title", "Client", "Due Date", "Priority", "Status", "Description"];
    const csvContent = [
      headers.join(","),
      ...tasks.map(t => {
        const clientName = t.client ? `${t.client.firstName || ""} ${t.client.lastName || ""}`.trim() : "N/A";
        return [
          t.title || "N/A",
          clientName || "N/A",
          t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "N/A",
          t.priority || "N/A",
          t.status || "N/A",
          t.description || "N/A"
        ].map(field => `"${(field || "").toString().replace(/"/g, '""')}"`).join(",")
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Tasks_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === "pdf") {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF();
    doc.text("Tasks Export", 14, 15);
    
    const tableData = tasks.map(t => {
      const clientName = t.client ? `${t.client.firstName || ""} ${t.client.lastName || ""}`.trim() : "N/A";
      return [
        t.title || "N/A",
        clientName || "N/A",
        t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "N/A",
        t.priority || "N/A",
        t.status || "N/A",
        t.description || "N/A"
      ];
    });

    autoTable(doc, {
      head: [["Title", "Client", "Due Date", "Priority", "Status", "Description"]],
      body: tableData,
      startY: 20,
    });
    
    doc.save(`Tasks_Export_${new Date().toISOString().split('T')[0]}.pdf`);
  }
};
