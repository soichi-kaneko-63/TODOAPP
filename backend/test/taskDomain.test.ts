import { describe, expect, it } from 'vitest';
import { isTaskStatus } from '../src/domain/task.js';

describe('isTaskStatus', () => {
  it.each(['pending', 'in_progress', 'completed'])(
    'accepts the %s status',
    (status) => {
      expect(isTaskStatus(status)).toBe(true);
    },
  );

  it.each(['unknown', '', 1, null, undefined])(
    'rejects invalid status %s',
    (status) => {
      expect(isTaskStatus(status)).toBe(false);
    },
  );
});
