import { Router } from 'express';
import { TaskController } from '../controllers/taskController.js';

export function createTaskRoutes(controller: TaskController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
