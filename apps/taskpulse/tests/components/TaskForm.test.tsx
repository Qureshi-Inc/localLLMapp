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
        status: 'In Progress',
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
});
