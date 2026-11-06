import type { CreateTaskDto, UpdateTaskDto } from '../dtos/taskDtos.js';
import {
  normalizeTaskTitle,
  type Task,
} from '../domain/task.js';
import type { TaskRepository } from '../repositories/taskRepository.js';

export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  listTasks(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  createTask(dto: CreateTaskDto): Promise<Task> {
    return this.taskRepository.create({
      title: normalizeTaskTitle(dto.title),
      status: dto.status ?? 'pending',
    });
  }

  updateTask(id: number, dto: UpdateTaskDto): Promise<Task | null> {
    return this.taskRepository.update(id, {
      title: normalizeTaskTitle(dto.title),
      status: dto.status,
    });
  }

  deleteTask(id: number): Promise<boolean> {
    return this.taskRepository.delete(id);
  }
}
