import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/lib/theme', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: jest.fn().mockReturnValue({ theme: 'light', toggleTheme: jest.fn() }),
}));

// Import after mocks
import DashboardPage from '@/app/dashboard/page';

const { usePathname } = require('next/navigation');

const mockTasks = [
  { id: '1', title: 'Task One', description: 'First task', status: 'Todo' as const, priority: 'Medium' as const, createdAt: '2024-01-10T00:00:00Z' },
  { id: '2', title: 'Task Two', description: 'Second task', status: 'In Progress' as const, priority: 'High' as const, createdAt: '2024-01-09T00:00:00Z' },
  { id: '3', title: 'Task Three', description: 'Third task', status: 'Done' as const, priority: 'Low' as const, createdAt: '2024-01-08T00:00:00Z' },
];

describe('Dashboard Component', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/dashboard');
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTasks),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the Dashboard heading', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('renders the subtitle text', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Overview of your tasks and productivity')).toBeInTheDocument();
    });
  });

  it('renders stat cards for Todo, In Progress, and Done', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const todoTexts = screen.getAllByText('Todo');
      expect(todoTexts.length).toBeGreaterThan(0);

      const inProgressTexts = screen.getAllByText('In Progress');
      expect(inProgressTexts.length).toBeGreaterThan(0);

      const doneTexts = screen.getAllByText('Done');
      expect(doneTexts.length).toBeGreaterThan(0);
    });
  });

  it('displays correct counts in stat cards', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const allOnes = screen.getAllByText('1');
      expect(allOnes.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('renders Weekly Activity chart placeholder', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Weekly Activity')).toBeInTheDocument();
      expect(screen.getByText('Tasks created per day this week')).toBeInTheDocument();
    });
  });

  it('renders Task Distribution chart placeholder', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Task Distribution')).toBeInTheDocument();
      expect(screen.getByText('Breakdown by status')).toBeInTheDocument();
    });
  });

  it('renders Recent Tasks section', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Recent Tasks')).toBeInTheDocument();
      expect(screen.getByText('Your most recently updated tasks')).toBeInTheDocument();
    });
  });

  it('displays recent task titles', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Task One')).toBeInTheDocument();
      expect(screen.getByText('Task Two')).toBeInTheDocument();
      expect(screen.getByText('Task Three')).toBeInTheDocument();
    });
  });

  it('displays status text for tasks', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const todoTexts = screen.getAllByText('Todo');
      expect(todoTexts.length).toBeGreaterThan(0);

      const inProgressTexts = screen.getAllByText('In Progress');
      expect(inProgressTexts.length).toBeGreaterThan(0);

      const doneTexts = screen.getAllByText('Done');
      expect(doneTexts.length).toBeGreaterThan(0);
    });
  });

  it('renders Quick Stats section', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Quick Stats')).toBeInTheDocument();
      expect(screen.getByText('Summary overview')).toBeInTheDocument();
    });
  });

  it('displays Total Tasks count in Quick Stats', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      const allThrees = screen.getAllByText('3');
      expect(allThrees.length).toBeGreaterThan(0);
    });
  });

  it('displays Completion Rate in Quick Stats', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    });
  });

  it('renders New Task button linking to /tasks', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /new task/i });
      expect(link).toHaveAttribute('href', '/tasks');
    });
  });

  it('renders View all link in Recent Tasks section', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /view all/i });
      expect(link).toHaveAttribute('href', '/tasks');
    });
  });

  it('renders progress bars in stat cards', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const progressBars = document.querySelectorAll('[class*="rounded-full"][class*="h-2"]');
      expect(progressBars.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('renders bar chart with day labels', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
      expect(screen.getByText('Sun')).toBeInTheDocument();
    });
  });

  it('renders donut chart legend items', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Completed')).toBeInTheDocument();
      const inProgressTexts = screen.getAllByText('In Progress');
      expect(inProgressTexts.length).toBeGreaterThan(0);
      const todoTexts = screen.getAllByText('Todo');
      expect(todoTexts.length).toBeGreaterThan(0);
    });
  });

  it('shows loading state before data loads', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise(() => {})
    );
    render(<DashboardPage />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders delete buttons for tasks', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const deleteButtons = document.querySelectorAll('[title="Delete"]');
      expect(deleteButtons.length).toBe(3);
    });
  });

  it('opens delete confirmation dialog when delete button is clicked', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const deleteButtons = document.querySelectorAll('[title="Delete"]');
      expect(deleteButtons.length).toBe(3);
    });
    const deleteButton = document.querySelectorAll('[title="Delete"]')[0];
    fireEvent.click(deleteButton);
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog?.textContent).toContain('Delete Task');
    expect(dialog?.textContent).toMatch(/are you sure you want to delete/i);
    const cancelButtons = dialog?.querySelectorAll('button');
    expect(cancelButtons && cancelButtons.length >= 2).toBe(true);
  });

  it('closes confirmation dialog when cancel is clicked', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const deleteButtons = document.querySelectorAll('[title="Delete"]');
      expect(deleteButtons.length).toBe(3);
    });
    const deleteButton = document.querySelectorAll('[title="Delete"]')[0];
    fireEvent.click(deleteButton);
    const dialog = document.querySelector('[role="dialog"]');
    const cancelBtn = dialog?.querySelector('button');
    if (cancelBtn) {
      fireEvent.click(cancelBtn);
    }
    await waitFor(() => {
      const confirmDialogs = document.querySelectorAll('[role="dialog"]');
      expect(confirmDialogs.length).toBe(0);
    });
  });

  it('renders status toggle buttons for tasks', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const toggleButtons = document.querySelectorAll('[title="Complete"], [title="Reopen"]');
      expect(toggleButtons.length).toBe(3);
    });
  });

  it('fetches tasks on mount', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/tasks');
    });
  });

  it('handles empty tasks list', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('No tasks yet. Create your first task to get started!')).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('toggles task status when complete button is clicked', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTasks),
      })
    );
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ ok: true })
    );
    render(<DashboardPage />);
    await waitFor(() => {
      const todoTexts = screen.getAllByText('Todo');
      expect(todoTexts.length).toBeGreaterThan(0);
    });
    const completeButtons = document.querySelectorAll('[title="Complete"]');
    if (completeButtons.length > 0) {
      fireEvent.click(completeButtons[0]);
    }
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/tasks/'), expect.objectContaining({ method: 'PATCH' }));
    });
  });

  it('renders loading skeletons during initial load', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise(() => {})
    );
    render(<DashboardPage />);
    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
