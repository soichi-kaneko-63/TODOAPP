export const TASK_STATUSES = [
  'pending',
  'in_progress',
  'completed',
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  created_at: Date;
  updated_at: Date;
}

export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskValidationError';
  }
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return (
    typeof value === 'string' &&
    (TASK_STATUSES as readonly string[]).includes(value)
  );
}

export function normalizeTaskTitle(title: string): string {
  const normalizedTitle = title.trim();
  if (normalizedTitle.length === 0 || normalizedTitle.length > 200) {
    throw new TaskValidationError(
      'title must contain 1 to 200 characters',
    );
  }

  return normalizedTitle;
}
