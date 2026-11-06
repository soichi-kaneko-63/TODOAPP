import { createApp } from './app.js';
import { pool } from './db.js';
import { TaskController } from './controllers/taskController.js';
import { PostgresTaskRepository } from './repositories/postgresTaskRepository.js';
import { TaskService } from './services/taskService.js';

const port = Number(process.env.PORT ?? 3001);
const taskRepository = new PostgresTaskRepository(pool);
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);
const app = createApp(taskController, async () => {
  await pool.query('SELECT 1');
});

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Task API listening on http://127.0.0.1:${port}`);
});

async function shutdown(): Promise<void> {
  server.close(async (error) => {
    if (error) {
      console.error('Failed to close HTTP server:', error);
      process.exitCode = 1;
    }

    await pool.end();
  });
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
