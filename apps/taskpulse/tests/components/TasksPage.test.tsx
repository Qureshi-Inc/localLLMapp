import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TasksPage from '@/app/tasks/page';

const mockTasks = [
  { id: '1', title: 'Task One', description: 'First task description', status: 'Todo' as const, createdAt: '2025-01-15T10:00:00Z' },
  { id: '2', title: 'Task Two', description: 'Second task description', status: 'In Progress' as const, createdAt: '2025-01-16T10:00:00Z' },
  { id: '3', title: 'Task Three', description: 'Third task description', status: 'Done' as const, createdAt: '2025-01-17T10:00:00Z' },
];

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    if (url === '/api/tasks') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTasks),
      } as Response);
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
  });
});

describe('TasksPage Component', () => {
  it('renders the page title', async () => {
    await act(async () => {
      render(<TasksPage />);
    });
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('renders loading spinner initially', () => {
    render(<TasksPage />);
    const spinner = document.querySelector('[class*="animate-spin"]');
    expect(spinner).toBeInTheDocument();
  });

  it('renders tasks in table rows', async () => {
    await act(async () => {
      render(<TasksPage />);
    });
    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(screen.getByText('Task Two')).toBeInTheDocument();
    expect(screen.getByText('Task Three')).toBeInTheDocument();
  });

  it('renders table headers', async () => {
    await act(async () => {
      render(<TasksPage />);
    });
    const headers = screen.getAllByText(/^(Task|Status|Actions)$/);
    expect(headers.length).toBeGreaterThanOrEqual(3);
  });

  it('displays status badges correctly', async () => {
    await act(async () => {
      render(<TasksPage />);
    });
    const statusBadges = document.querySelectorAll('[class*="rounded-full"]');
    const badgeTexts = Array.from(statusBadges).map(el => el.textContent);
    expect(badgeTexts).toContain('Todo');
    expect(badgeTexts).toContain('In Progress');
    expect(badgeTexts).toContain('Done');
  });

  it('renders action buttons for each task', async () => {
    await act(async () => {
      render(<TasksPage />);
    });
    const completeButtons = screen.getAllByRole('button', { name: /complete/i });
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(completeButtons).toHaveLength(2);
    expect(editButtons).toHaveLength(3);
    expect(deleteButtons).toHaveLength(3);
  });

  it('renders the reopen button for completed tasks', async () => {
    await act(async () => {
      render(<TasksPage />);
    });
    expect(screen.getByRole('button', { name: /reopen/i })).toBeInTheDocument();
  });

  it('shows empty state when no tasks', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce((url: string) => {
      if (url === '/api/tasks') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    });

    await act(async () => {
      render(<TasksPage />);
    });
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first task above.')).toBeInTheDocument();
  });

  it('renders the task form', async () => {
    await act(async () => {
      render(<TasksPage />);
    });
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('shows the created date for tasks', async () => {
    await act(async () => {
      render(<TasksPage />);
    });
    expect(screen.getByText('Jan 15, 2025')).toBeInTheDocument();
    expect(screen.getByText('Jan 16, 2025')).toBeInTheDocument();
    expect(screen.getByText('Jan 17, 2025')).toBeInTheDocument();
  });
});
