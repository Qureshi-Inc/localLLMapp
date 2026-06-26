import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskForm from '@/components/TaskForm';

describe('TaskForm Component', () => {
  it('renders create task form', () => {
    render(<TaskForm onSubmit={jest.fn()} />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('renders edit task form with initial data', () => {
    render(
      <TaskForm
        onSubmit={jest.fn()}
        initialData={{ title: 'Edit Me', description: 'Edit Desc', status: 'Todo' }}
      />
    );
    expect(screen.getByLabelText(/title/i)).toHaveValue('Edit Me');
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
  });

  it('calls onSubmit with correct data', () => {
    const handleSubmit = jest.fn();
    render(<TaskForm onSubmit={handleSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New Desc' } });
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'In Progress' } });
    
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'New Desc',
      status: 'In Progress',
    });
  });
});