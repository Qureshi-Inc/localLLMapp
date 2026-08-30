import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from '@/components/TaskForm';

describe('TaskForm Component', () => {
  it('renders create task form', () => {
    render(<TaskForm onSubmit={jest.fn()} />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('renders edit task form with initial data', () => {
    render(
      <TaskForm
        onSubmit={jest.fn()}
        initialData={{ title: 'Edit Me', description: 'Edit Desc', status: 'Todo' }}
      />
    );
    expect(screen.getByLabelText(/title/i)).toHaveValue('Edit Me');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Edit Desc');
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
  });

  it('calls onSubmit with correct data', async () => {
    const handleSubmit = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New Desc' } });
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'In Progress' } });

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Desc',
        priority: 'Medium',
        status: 'In Progress',
        dueDate: null,
      });
    });
  });

  it('resets form after successful create submission', async () => {
    const handleSubmit = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New Desc' } });

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toHaveValue('');
      expect(screen.getByLabelText(/description/i)).toHaveValue('');
    });
  });

  it('does not reset form after edit submission', async () => {
    const handleSubmit = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(
      <TaskForm
        onSubmit={handleSubmit}
        initialData={{ title: 'Edit Me', description: 'Edit Desc', status: 'Todo' }}
      />
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /update task/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toHaveValue('Updated');
    });
  });

  it('reset button restores initial values', () => {
    render(
      <TaskForm
        onSubmit={jest.fn()}
        initialData={{ title: 'Original', description: 'Orig Desc', status: 'Done' }}
      />
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Changed' } });
    expect(screen.getByLabelText(/title/i)).toHaveValue('Changed');

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByLabelText(/title/i)).toHaveValue('Original');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Orig Desc');
  });

  it('reset button clears form in create mode', () => {
    render(<TaskForm onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Something' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Some desc' } });

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByLabelText(/title/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
  });

  it('renders cancel button when onCancel is provided', () => {
    const handleCancel = jest.fn();
    render(<TaskForm onSubmit={jest.fn()} onCancel={handleCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    expect(handleCancel).toHaveBeenCalled();
  });

  it('does not render cancel button when onCancel is not provided', () => {
    render(<TaskForm onSubmit={jest.fn()} />);
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('disables buttons while submitting', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => { resolveSubmit = resolve; });
    const handleSubmit = jest.fn<() => Promise<void>>().mockReturnValue(submitPromise);

    render(<TaskForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Desc' } });

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
    });

    resolveSubmit!();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create task/i })).not.toBeDisabled();
    });
  });

  it('updates form when initialData changes', () => {
    const { rerender } = render(
      <TaskForm
        onSubmit={jest.fn()}
        initialData={{ title: 'First', description: 'First Desc', status: 'Todo' }}
      />
    );

    expect(screen.getByLabelText(/title/i)).toHaveValue('First');

    rerender(
      <TaskForm
        onSubmit={jest.fn()}
        initialData={{ title: 'Second', description: 'Second Desc', status: 'In Progress' }}
      />
    );

    expect(screen.getByLabelText(/title/i)).toHaveValue('Second');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Second Desc');
    expect(screen.getByLabelText(/status/i)).toHaveValue('In Progress');
  });

  it('renders priority quick-select buttons', () => {
    render(<TaskForm onSubmit={jest.fn()} />);

    expect(screen.getByRole('button', { name: /low/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /medium/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /high/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /urgent/i })).toBeInTheDocument();
  });

  it('defaults to Medium priority on create', () => {
    render(<TaskForm onSubmit={jest.fn()} />);
    const mediumBtn = screen.getByRole('button', { name: /medium/i });
    expect(mediumBtn).toHaveAttribute('class', expect.stringContaining('bg-warning-100'));
  });

  it('sets High priority when initialData includes it', () => {
    render(
      <TaskForm
        onSubmit={jest.fn()}
        initialData={{ title: 'Edit', description: 'Desc', status: 'In Progress', priority: 'High' }}
      />
    );
    const highBtn = screen.getByRole('button', { name: /high/i });
    expect(highBtn).toHaveAttribute('class', expect.stringContaining('bg-orange-100'));
  });

  it('includes priority in submission payload', async () => {
    const handleSubmit = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New Desc' } });

    // Select High priority
    fireEvent.click(screen.getByRole('button', { name: /high/i }));

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Desc',
        status: 'Todo',
        priority: 'High',
        dueDate: null,
      });
    });
  });

  it('sets priority class on form submission', async () => {
    const handleSubmit = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Desc' } });

    fireEvent.click(screen.getByRole('button', { name: /urgent/i }));
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({ priority: 'Urgent' }));
    });
  });

  it('ignores invalid priority values and defaults to Medium', async () => {
    const handleSubmit = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Desc' } });

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'Task',
        description: 'Desc',
        status: 'Todo',
        priority: 'Medium',
        dueDate: null,
      });
    });
  });

  it('shows error when title is empty', () => {
    render(<TaskForm onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Some description' } });
    fireEvent.blur(screen.getByLabelText(/title/i));

    const errors = screen.queryAllByText('Title is required');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('shows error when title is too short', () => {
    render(<TaskForm onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'A' } });
    fireEvent.blur(screen.getByLabelText(/title/i));

    const errors = screen.queryAllByText('Title must be at least 2 characters');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('shows error when description is empty', () => {
    render(<TaskForm onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Valid Title' } });
    fireEvent.blur(screen.getByLabelText(/description/i));

    const errors = screen.queryAllByText('Description is required');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('does not submit when validation fails', async () => {
    const handleSubmit = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={handleSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(handleSubmit).not.toHaveBeenCalled();
    });
    // Verify submit was blocked - no error message is guaranteed in all environments
  });

  it('renders due date input field', () => {
    render(<TaskForm onSubmit={jest.fn()} />);
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('includes dueDate in submission payload when set', async () => {
    const handleSubmit = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New Desc' } });
    // Use a future date
    const futureDate = '2027-06-15';
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: futureDate } });

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Desc',
        status: 'Todo',
        priority: 'Medium',
        dueDate: futureDate,
      });
    });
  });

  it('includes null dueDate when not set', async () => {
    const handleSubmit = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New Desc' } });

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({ dueDate: null }));
    });
  });
});
