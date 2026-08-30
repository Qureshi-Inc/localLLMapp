import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import TaskForm from '@/components/TaskForm';

describe('TaskForm — validation edge cases', () => {
  it('does not call onSubmit when title is empty', async () => {
    const handle = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={handle} />);
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Desc' } });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => {
      expect(handle).not.toHaveBeenCalled();
    });
  });

  it('does not call onSubmit when description is empty', async () => {
    const handle = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={handle} />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Title' } });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => {
      expect(handle).not.toHaveBeenCalled();
    });
  });

  it('does not call onSubmit when both fields are empty', async () => {
    const handle = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={handle} />);
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => {
      expect(handle).not.toHaveBeenCalled();
    });
  });

  it('calls onSubmit when both fields are valid', async () => {
    const handle = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={handle} />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'A good title' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Valid description' } });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => {
      expect(handle).toHaveBeenCalledWith(expect.objectContaining({
        title: 'A good title',
        description: 'Valid description',
      }));
    });
  });

  it('uses aria-invalid on title when error is present', async () => {
    render(<TaskForm onSubmit={jest.fn()} />);
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'x' } });
    fireEvent.blur(titleInput);
    await waitFor(() => {
      expect(titleInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('submits with only by-blurred field validated', async () => {
    // When only the title field is touched (blurred), submit should still validate both fields
    const handle = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={handle} />);
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Ab' } });
    fireEvent.blur(titleInput);
    // Now submit — describe hasn't been touched, but submit sets all touched
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => {
      expect(handle).not.toHaveBeenCalled();
    });
  });
});
