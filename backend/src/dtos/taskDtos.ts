import type { TaskStatus } from '../domain/task.js';

export interface CreateTaskDto {
  title: string;
  status?: TaskStatus;
}

export interface UpdateTaskDto {
  title: string;
  status: TaskStatus;
}
