import cors from 'cors';
import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from 'express';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { OpenAPIV3 } from 'openapi-types';
import swaggerUi from 'swagger-ui-express';
import { parseDocument } from 'yaml';
import { TaskController } from './controllers/taskController.js';
import { TaskValidationError } from './domain/task.js';
import { createTaskRoutes } from './routes/taskRoutes.js';

const openApiYamlPath = fileURLToPath(
  new URL('../../docs/openapi.yaml', import.meta.url),
);
const parsedOpenApi = parseDocument(readFileSync(openApiYamlPath, 'utf8'));
if (parsedOpenApi.errors.length > 0) {
  throw new Error(
    `Failed to parse OpenAPI YAML: ${parsedOpenApi.errors.map((error) => error.message).join('; ')}`,
  );
}
const openApiDocument = parsedOpenApi.toJS() as OpenAPIV3.Document;

export function createApp(
  taskController: TaskController,
  checkDatabase: () => Promise<void>,
): express.Express {
  const app = express();
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '100kb' }));
  app.get('/api-docs/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.get('/', (_req, res) => {
    res.json({
      name: 'Task API',
      health: '/api/health',
      tasks: '/tasks',
      documentation: '/api-docs',
    });
  });

  const healthCheck: RequestHandler = async (_req, res) => {
    await checkDatabase();
    res.json({ status: 'ok' });
  };
  app.get('/api/health', healthCheck);
  app.use('/tasks', createTaskRoutes(taskController));

  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof TaskValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }

    console.error('Unhandled API error:', error);
    const status =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof error.status === 'number' &&
      error.status < 500
        ? error.status
        : 500;
    res.status(status).json({
      error: status === 500 ? 'Internal server error' : 'Invalid request',
    });
  };
  app.use(errorHandler);

  return app;
}
