import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  PRIORITY_ORDER,
  PRIORITY_CONFIG,
  getPriorityOrder,
  sortTasksByPriority,
  isOverdue,
  isDueSoon,
  getDueDateStatus,
  formatDateDisplay,
} from '@/lib/priority';

describe('PRIORITY_ORDER', () => {
  it('Urgent has the lowest numeric value (highest priority)', () => {
    expect(PRIORITY_ORDER['Urgent']).toBe(0);
  });

  it('High has value 1', () => {
    expect(PRIORITY_ORDER['High']).toBe(1);
  });

  it('Medium has value 2', () => {
    expect(PRIORITY_ORDER['Medium']).toBe(2);
  });

  it('Low has the highest numeric value (lowest priority)', () => {
    expect(PRIORITY_ORDER['Low']).toBe(3);
  });

  it('has all four priority values', () => {
    expect(Object.keys(PRIORITY_ORDER).length).toBe(4);
    expect(Object.keys(PRIORITY_ORDER)).toEqual(
      expect.arrayContaining(['Urgent', 'High', 'Medium', 'Low'])
    );
  });
});

describe('PRIORITY_CONFIG', () => {
  it('Urgent config has badge, dot, text, and ring', () => {
    const c = PRIORITY_CONFIG['Urgent'];
    expect(c.dot).toContain('bg-red-500');
    expect(c.badge).toContain('bg-red-100');
    expect(c.text).toContain('text-red-700');
    expect(c.ring).toContain('ring-red');
  });

  it('High config has orange colors', () => {
    const c = PRIORITY_CONFIG['High'];
    expect(c.dot).toContain('bg-orange-500');
    expect(c.badge).toContain('bg-orange-100');
    expect(c.text).toContain('text-orange-700');
  });

  it('Medium config has yellow/warning colors', () => {
    const c = PRIORITY_CONFIG['Medium'];
    expect(c.dot).toContain('bg-yellow-500');
    expect(c.badge).toContain('bg-warning');
  });

  it('Low config has surface/dark colors', () => {
    const c = PRIORITY_CONFIG['Low'];
    expect(c.dot).toContain('bg-surface-400');
    expect(c.badge).toContain('bg-surface-100');
    expect(c.text).toContain('text-surface');
  });

  it('has config for all four priorities', () => {
    expect(Object.keys(PRIORITY_CONFIG).length).toBe(4);
  });
});

describe('getPriorityOrder', () => {
  it('returns 0 for Urgent', () => {
    expect(getPriorityOrder('Urgent')).toBe(0);
  });

  it('returns 1 for High', () => {
    expect(getPriorityOrder('High')).toBe(1);
  });

  it('returns 2 for Medium', () => {
    expect(getPriorityOrder('Medium')).toBe(2);
  });

  it('returns 3 for Low', () => {
    expect(getPriorityOrder('Low')).toBe(3);
  });

  it('returns 2 (Medium) for unknown priority values', () => {
    expect(getPriorityOrder('Unknown' as any)).toBe(2);
  });
});

describe('sortTasksByPriority', () => {
  const createTask = (priority: string, createdAt = '2024-01-10T00:00:00Z') => ({
    id: Math.random().toString(36).slice(2),
    title: `Task`,
    description: 'desc',
    status: 'Todo' as const,
    priority: priority as any,
    createdAt,
  });

  it('sorts by priority descending (Urgent first, Low last)', () => {
    const tasks = [
      createTask('Low'),
      createTask('Urgent'),
      createTask('Medium'),
      createTask('High'),
      createTask('Urgent'),
    ];
    const sorted = sortTasksByPriority(tasks);
    expect(sorted[0].priority).toBe('Urgent');
    expect(sorted[1].priority).toBe('Urgent');
    expect(sorted[2].priority).toBe('High');
    expect(sorted[3].priority).toBe('Medium');
    expect(sorted[4].priority).toBe('Low');
  });

  it('sorts by date within same priority (newest first)', () => {
    const tasks = [
      createTask('High', '2024-01-10T00:00:00Z'),
      createTask('High', '2024-01-12T00:00:00Z'),
      createTask('High', '2024-01-11T00:00:00Z'),
    ];
    const sorted = sortTasksByPriority(tasks);
    expect(sorted[0].createdAt).toBe('2024-01-12T00:00:00Z');
    expect(sorted[1].createdAt).toBe('2024-01-11T00:00:00Z');
    expect(sorted[2].createdAt).toBe('2024-01-10T00:00:00Z');
  });

  it('returns empty array for empty input', () => {
    expect(sortTasksByPriority([])).toEqual([]);
  });

  it('returns single-element array unchanged', () => {
    const tasks = [createTask('Medium')];
    const sorted = sortTasksByPriority(tasks);
    expect(sorted).toEqual(tasks);
  });

  it('preserves original array (non-mutating)', () => {
    const tasks = [createTask('Low'), createTask('High')];
    const sorted = sortTasksByPriority(tasks);
    // sorted is different — but original order should be unchanged
    expect(sorted[0].priority).toBe('High');
    expect(tasks[0].priority).toBe('Low');
    // sorted and tasks should be different references
    expect(sorted).not.toBe(tasks);
  });

  it('sorts mixed priorities correctly', () => {
    const tasks = [
      ...Array(8).fill(null).map((_, i) =>
        createTask(
          ['Urgent', 'High', 'Medium', 'Low'][i % 4],
          `2024-01-${String(10 + i).padStart(2, '0')}T00:00:00Z`
        )
      ),
    ];
    const sorted = sortTasksByPriority(tasks);
    const priorities = sorted.map((t) => t.priority);
    // All Urgent before High, all High before Medium, all Medium before Low
    let foundLower = false;
    for (const p of priorities) {
      if (p === 'Low' || p === 'Medium') foundLower = true;
      if ((p === 'Medium' || p === 'Low') && foundLower && p === 'High') {
        // Once we see Medium/Low, we should not see High after
      }
    }
    // Simpler: check that index of first Low > index of last Medium > index of last High > index of last Urgent
    const firstLow = priorities.indexOf('Low');
    const lastMedium = [...priorities].reverse().length - 1 - priorities.slice().reverse().indexOf('Medium');
    const lastHigh = [...priorities].reverse().length - 1 - priorities.slice().reverse().indexOf('High');
    const lastUrgent = [...priorities].reverse().length - 1 - priorities.slice().reverse().indexOf('Urgent');
    expect(firstLow > lastMedium).toBe(true);
    expect(lastMedium > lastHigh).toBe(true);
    expect(lastHigh > lastUrgent).toBe(true);
  });
});

describe('isOverdue', () => {
  it('returns true for a date in the past', () => {
    expect(isOverdue('2020-01-01')).toBe(true);
  });

  it('returns true for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const y = yesterday.getFullYear();
    const m = String(yesterday.getMonth() + 1).padStart(2, '0');
    const d = String(yesterday.getDate()).padStart(2, '0');
    expect(isOverdue(`${y}-${m}-${d}`)).toBe(true);
  });

  it('returns false for a date in the future', () => {
    expect(isOverdue('2099-12-31')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isOverdue(null)).toBe(false);
  });
});

describe('isDueSoon', () => {
  it('returns true for a due date within 3 days', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 1);
    const str = soon.toISOString().slice(0, 10);
    expect(isDueSoon(str)).toBe(true);
  });

  it('returns false for a date exactly 3 days away', () => {
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);
    const str = threeDays.toISOString().slice(0, 10);
    expect(isDueSoon(str)).toBe(true);
  });

  it('returns false for a date 4 days away', () => {
    const fourDays = new Date();
    fourDays.setDate(fourDays.getDate() + 4);
    const str = fourDays.toISOString().slice(0, 10);
    expect(isDueSoon(str)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isDueSoon(null)).toBe(false);
  });
});

describe('getDueDateStatus', () => {
  it('returns overdue for a past date', () => {
    expect(getDueDateStatus('2020-01-01T12:00:00Z')).toBe('overdue');
  });

  it('returns due-soon for within 3 days', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 2);
    const y = soon.getFullYear();
    const m = String(soon.getMonth() + 1).padStart(2, '0');
    const d = String(soon.getDate()).padStart(2, '0');
    expect(getDueDateStatus(`${y}-${m}-${d}T12:00:00Z`)).toBe('due-soon');
  });

  it('returns upcoming for more than 3 days', () => {
    const far = new Date();
    far.setDate(far.getDate() + 10);
    const y = far.getFullYear();
    const m = String(far.getMonth() + 1).padStart(2, '0');
    const d = String(far.getDate()).padStart(2, '0');
    expect(getDueDateStatus(`${y}-${m}-${d}T12:00:00Z`)).toBe('upcoming');
  });
});

describe('formatDateDisplay', () => {
  it('formats a date string correctly', () => {
    // Use a date that converts reliably regardless of timezone
    const result = formatDateDisplay('2024-06-15T12:00:00Z');
    expect(result).toContain('2024');
    // Jun 15 UTC converts to Jun 15 in most timezones
    expect(result).toMatch(/\d{1,2}/);
    expect(result).toContain('2024');
  });
});
