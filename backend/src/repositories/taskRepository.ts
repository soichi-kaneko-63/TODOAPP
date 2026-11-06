import type { Task } from '../domain/task.js';

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  create(task: Pick<Task, 'title' | 'status'>): Promise<Task>;
  update(
    id: number,
    task: Pick<Task, 'title' | 'status'>,
  ): Promise<Task | null>;
  delete(id: number): Promise<boolean>;
}
