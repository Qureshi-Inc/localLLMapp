import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
}));

jest.mock('@/lib/theme', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: jest.fn().mockReturnValue({ theme: 'light', toggleTheme: jest.fn() }),
}));

// Import after mocking
import TasksPage from '@/app/tasks/page';

const mockTasks = [
  { id: '1', title: 'Task One', description: 'First task description', status: 'Todo' as const, priority: 'Medium' as const, createdAt: '2025-01-15T10:00:00Z', dueDate: null },
  { id: '2', title: 'Task Two', description: 'Second task description', status: 'In Progress' as const, priority: 'High' as const, createdAt: '2025-01-16T10:00:00Z', dueDate: null },
  { id: '3', title: 'Task Three', description: 'Third task description', status: 'Done' as const, priority: 'Low' as const, createdAt: '2025-01-17T10:00:00Z', dueDate: null },
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

  it('renders loading spinner initially', async () => {
    // Block the fetch so the loading state persists long enough to test
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
    render(<TasksPage />);
    // Wait briefly for React to render, then check
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
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
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThanOrEqual(4);
    const headerTexts = headers.map(h => h.textContent).join(' ');
    expect(headerTexts).toContain('Priority');
    expect(headerTexts).toContain('Task');
    expect(headerTexts).toContain('Status');
    expect(headerTexts).toContain('Actions');
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

  it('opens delete confirmation dialog when delete button is clicked', async () => {
    await act(async () => {
      render(<TasksPage />);
    });
    const deleteButtons = document.querySelectorAll('[title="Delete task"]');
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog?.textContent).toContain('Delete Task');
    expect(dialog?.textContent).toMatch(/are you sure you want to delete/i);
  });

  it('has cancel and delete buttons in confirmation dialog', async () => {
    await act(async () => {
      render(<TasksPage />);
    });
    const deleteButtons = document.querySelectorAll('[title="Delete task"]');
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });
    const dialog = document.querySelector('[role="dialog"]');
    expect(within(dialog!).getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(within(dialog!).getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('displays pagination controls when tasks exist', async () => {
    const manyTasks = Array.from({ length: 15 }, (_, i) => ({
      id: String(i + 1),
      title: `Task ${i + 1}`,
      description: `Description for task ${i + 1}`,
      status: 'Todo' as const,
      priority: 'Medium' as const,
      createdAt: `2025-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
      dueDate: null,
    }));
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.toString().includes('/api/tasks')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(manyTasks) });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    await act(async () => {
      render(<TasksPage />);
    });
    const showingText = screen.getByText(/showing/i);
    expect(showingText).toBeInTheDocument();
    const pageSizeSelect = document.querySelector('select[aria-label="Items per page"]');
    expect(pageSizeSelect).toBeInTheDocument();
  });

  it('renders search input and filter select', async () => {
    await act(async () => {
      render(<TasksPage />);
    });
    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
    const statusFilter = document.querySelector('select');
    expect(statusFilter).toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );
    render(<TasksPage />);
    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });
  });

  it('renders pagination with correct page count', async () => {
    const manyTasks = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      title: `Task ${i + 1}`,
      description: `Description ${i + 1}`,
      status: 'Todo' as const,
      priority: 'Medium' as const,
      createdAt: `2025-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
      dueDate: null,
    }));
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.toString().includes('/api/tasks')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(manyTasks) });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    await act(async () => {
      render(<TasksPage />);
    });
    const showingText = screen.getByText(/of 25 tasks/i);
    expect(showingText).toBeInTheDocument();
  });
});
