import type { Request, RequestHandler } from 'express';
import { isTaskStatus } from '../domain/task.js';
import type { CreateTaskDto, UpdateTaskDto } from '../dtos/taskDtos.js';
import { TaskService } from '../services/taskService.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function parseCreateTaskDto(
  body: unknown,
): { dto: CreateTaskDto } | { error: string } {
  if (!isRecord(body)) {
    return { error: 'Request body must be an object' };
  }
  if (Object.keys(body).some((key) => key !== 'title' && key !== 'status')) {
    return { error: 'Only title and status can be provided' };
  }

  const { title, status } = body;
  if (
    typeof title !== 'string' ||
    title.trim().length === 0 ||
    title.trim().length > 200
  ) {
    return { error: 'title must contain 1 to 200 characters' };
  }
  if (status !== undefined && !isTaskStatus(status)) {
    return { error: 'status must be pending, in_progress, or completed' };
  }

  return {
    dto: {
      title,
      ...(status === undefined ? {} : { status }),
    },
  };
}

function parseUpdateTaskDto(
  body: unknown,
): { dto: UpdateTaskDto } | { error: string } {
  if (!isRecord(body)) {
    return { error: 'Request body must be an object' };
  }
  if (
    Object.keys(body).some((key) => key !== 'title' && key !== 'status')
  ) {
    return { error: 'Only title and status can be updated' };
  }

  const { title, status } = body;
  if (
    typeof title !== 'string' ||
    title.trim().length === 0 ||
    title.trim().length > 200
  ) {
    return { error: 'title must contain 1 to 200 characters' };
  }
  if (!isTaskStatus(status)) {
    return { error: 'status must be pending, in_progress, or completed' };
  }

  return { dto: { title, status } };
}

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  list: RequestHandler = async (_req, res) => {
    res.json(await this.taskService.listTasks());
  };

  create: RequestHandler = async (req, res) => {
    const parsed = parseCreateTaskDto(req.body);
    if ('error' in parsed) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    res.status(201).json(await this.taskService.createTask(parsed.dto));
  };

  update: RequestHandler = async (req, res) => {
    const id = this.getId(req);
    if (id === null) {
      res.status(400).json({ error: 'id must be a positive integer' });
      return;
    }

    const parsed = parseUpdateTaskDto(req.body);
    if ('error' in parsed) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const task = await this.taskService.updateTask(id, parsed.dto);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  };

  delete: RequestHandler = async (req, res) => {
    const id = this.getId(req);
    if (id === null) {
      res.status(400).json({ error: 'id must be a positive integer' });
      return;
    }

    if (!(await this.taskService.deleteTask(id))) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.status(204).end();
  };

  private getId(req: Request): number | null {
    const value = req.params.id;
    return typeof value === 'string' ? parseId(value) : null;
  }
}
