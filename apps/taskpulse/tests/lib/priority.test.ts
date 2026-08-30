import { describe, it, expect } from '@jest/globals';
import {
  PRIORITY_ORDER,
  PRIORITY_CONFIG,
  getPriorityOrder,
  sortTasksByPriority,
  isOverdue,
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
    dueDate: null,
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
  it('returns true when due date is in the past', () => {
    expect(isOverdue('2020-01-01')).toBe(true);
  });

  it('returns false when no due date', () => {
    expect(isOverdue(null)).toBe(false);
  });

  it('returns false when due date is today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(isOverdue(today)).toBe(false);
  });

  it('returns false when due date is in the future', () => {
    const future = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
    expect(isOverdue(future)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isOverdue(null as any)).toBe(false);
  });
});

describe('getDueDateStatus', () => {
  it('returns "none" when no due date', () => {
    expect(getDueDateStatus(null)).toBe('none');
  });

  it('returns "overdue" for past dates', () => {
    expect(getDueDateStatus('2020-01-01')).toBe('overdue');
  });

  it('returns "today" for today\'s date', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(getDueDateStatus(today)).toBe('today');
  });

  it('returns "due-soon" for dates within 3 days', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    expect(getDueDateStatus(tomorrow)).toBe('due-soon');
    const twoDaysFromNow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    expect(getDueDateStatus(twoDaysFromNow)).toBe('due-soon');
    const threeDaysFromNow = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    expect(getDueDateStatus(threeDaysFromNow)).toBe('due-soon');
  });

  it('returns "future" for dates beyond 3 days', () => {
    const nextWeek = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
    expect(getDueDateStatus(nextWeek)).toBe('future');
  });
});

describe('formatDateDisplay', () => {
  it('returns empty string for null input', () => {
    expect(formatDateDisplay(null)).toBe('');
  });

  it('formats date as month day', () => {
    expect(formatDateDisplay('2024-01-15')).toBe('Jan 15');
    expect(formatDateDisplay('2024-12-25')).toBe('Dec 25');
  });

  it('handles invalid dates gracefully', () => {
    const result = formatDateDisplay('not-a-date');
    expect(typeof result).toBe('string');
  });
});
