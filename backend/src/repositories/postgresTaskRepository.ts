import type { Pool } from 'pg';
import type { Task } from '../domain/task.js';
import type { TaskRepository } from './taskRepository.js';

const taskColumns = 'id, title, status, created_at, updated_at';

export class PostgresTaskRepository implements TaskRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(): Promise<Task[]> {
    const result = await this.pool.query<Task>(
      `SELECT ${taskColumns} FROM tasks ORDER BY id ASC`,
    );
    return result.rows;
  }

  async create(task: Pick<Task, 'title' | 'status'>): Promise<Task> {
    const result = await this.pool.query<Task>(
      `INSERT INTO tasks (title, status)
       VALUES ($1, $2)
       RETURNING ${taskColumns}`,
      [task.title, task.status],
    );
    const createdTask = result.rows[0];
    if (!createdTask) {
      throw new Error('Task insert did not return a row');
    }

    return createdTask;
  }

  async update(
    id: number,
    task: Pick<Task, 'title' | 'status'>,
  ): Promise<Task | null> {
    const result = await this.pool.query<Task>(
      `UPDATE tasks
       SET title = $1, status = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING ${taskColumns}`,
      [task.title, task.status, id],
    );
    return result.rows[0] ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [id],
    );
    return result.rowCount !== 0;
  }
}
