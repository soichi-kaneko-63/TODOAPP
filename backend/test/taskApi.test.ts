import type { Server } from 'node:http';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { TaskController } from '../src/controllers/taskController.js';
import type { Task } from '../src/domain/task.js';
import type { TaskRepository } from '../src/repositories/taskRepository.js';
import { TaskService } from '../src/services/taskService.js';

const sampleTask: Task = {
  id: 1,
  title: 'Learn layered architecture',
  status: 'pending',
  created_at: new Date('2026-11-06T00:00:00.000Z'),
  updated_at: new Date('2026-11-06T00:00:00.000Z'),
};

const repository: TaskRepository = {
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = createApp(
    new TaskController(new TaskService(repository)),
    async () => {},
  );
  server = app.listen(0, '127.0.0.1');

  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Test server did not bind to a TCP port');
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Task API routes and controller', () => {
  it('creates a task and applies the default pending status', async () => {
    vi.mocked(repository.create).mockResolvedValue(sampleTask);

    const response = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: sampleTask.title }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      ...sampleTask,
      created_at: sampleTask.created_at.toISOString(),
      updated_at: sampleTask.updated_at.toISOString(),
    });
    expect(repository.create).toHaveBeenCalledWith({
      title: sampleTask.title,
      status: 'pending',
    });
  });

  it('returns a validation error without calling the repository', async () => {
    const response = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Task', status: 'unknown' }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'status must be pending, in_progress, or completed',
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('updates a task with PUT', async () => {
    const updatedTask = { ...sampleTask, status: 'completed' as const };
    vi.mocked(repository.update).mockResolvedValue(updatedTask);

    const response = await fetch(`${baseUrl}/tasks/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: sampleTask.title,
        status: 'completed',
      }),
    });

    expect(response.status).toBe(200);
    expect(repository.update).toHaveBeenCalledWith(1, {
      title: sampleTask.title,
      status: 'completed',
    });
  });

  it('returns 404 when an update targets a missing task', async () => {
    vi.mocked(repository.update).mockResolvedValue(null);

    const response = await fetch(`${baseUrl}/tasks/99`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Missing', status: 'pending' }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Task not found' });
  });

  it('deletes a task', async () => {
    vi.mocked(repository.delete).mockResolvedValue(true);

    const response = await fetch(`${baseUrl}/tasks/1`, { method: 'DELETE' });

    expect(response.status).toBe(204);
    expect(repository.delete).toHaveBeenCalledWith(1);
  });

  it('returns a database error through the common error handler', async () => {
    vi.mocked(repository.findAll).mockRejectedValue(new Error('database offline'));
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      const response = await fetch(`${baseUrl}/tasks`);

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({
        error: 'Internal server error',
      });
      expect(logError).toHaveBeenCalledOnce();
    } finally {
      logError.mockRestore();
    }
  });
});
