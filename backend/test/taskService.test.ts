import { beforeEach, describe, expect, it, vi } from 'vitest';
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

const service = new TaskService(repository);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('TaskService', () => {
  it('lists tasks through the repository', async () => {
    vi.mocked(repository.findAll).mockResolvedValue([sampleTask]);

    await expect(service.listTasks()).resolves.toEqual([sampleTask]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });

  it('creates a pending task by default and trims its title', async () => {
    vi.mocked(repository.create).mockResolvedValue(sampleTask);

    await expect(
      service.createTask({ title: '  Learn layered architecture  ' }),
    ).resolves.toEqual(sampleTask);
    expect(repository.create).toHaveBeenCalledWith({
      title: 'Learn layered architecture',
      status: 'pending',
    });
  });

  it('creates a task with the requested status', async () => {
    vi.mocked(repository.create).mockResolvedValue({
      ...sampleTask,
      status: 'in_progress',
    });

    await service.createTask({
      title: sampleTask.title,
      status: 'in_progress',
    });

    expect(repository.create).toHaveBeenCalledWith({
      title: sampleTask.title,
      status: 'in_progress',
    });
  });

  it('updates a task through the repository', async () => {
    const updatedTask = { ...sampleTask, title: 'Updated task', status: 'completed' as const };
    vi.mocked(repository.update).mockResolvedValue(updatedTask);

    await expect(
      service.updateTask(1, {
        title: ' Updated task ',
        status: 'completed',
      }),
    ).resolves.toEqual(updatedTask);
    expect(repository.update).toHaveBeenCalledWith(1, {
      title: 'Updated task',
      status: 'completed',
    });
  });

  it('returns null when the repository cannot find the task to update', async () => {
    vi.mocked(repository.update).mockResolvedValue(null);

    await expect(
      service.updateTask(42, { title: 'Missing task', status: 'pending' }),
    ).resolves.toBeNull();
  });

  it('deletes a task through the repository', async () => {
    vi.mocked(repository.delete).mockResolvedValue(true);

    await expect(service.deleteTask(1)).resolves.toBe(true);
    expect(repository.delete).toHaveBeenCalledWith(1);
  });

  it('reports when the repository cannot find a task to delete', async () => {
    vi.mocked(repository.delete).mockResolvedValue(false);

    await expect(service.deleteTask(42)).resolves.toBe(false);
  });

  it('rejects invalid titles before accessing the repository', async () => {
    expect(() => service.createTask({ title: '  ' })).toThrow(
      'title must contain 1 to 200 characters',
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('accepts a title at the 200-character limit', async () => {
    const title = 'a'.repeat(200);
    vi.mocked(repository.create).mockResolvedValue({ ...sampleTask, title });

    await service.createTask({ title });

    expect(repository.create).toHaveBeenCalledWith({
      title,
      status: 'pending',
    });
  });

  it('rejects titles longer than 200 characters before accessing the repository', async () => {
    expect(() => service.createTask({ title: 'a'.repeat(201) })).toThrow(
      'title must contain 1 to 200 characters',
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});
