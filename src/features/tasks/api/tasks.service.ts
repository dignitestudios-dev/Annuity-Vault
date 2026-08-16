import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
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
