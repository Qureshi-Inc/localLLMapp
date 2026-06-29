'use client';

import { useState, useEffect, FormEvent } from 'react';

interface TaskFormProps {
  onSubmit: (task: { title: string; description: string; status: 'Todo' | 'In Progress' | 'Done' }) => void | Promise<void>;
  initialData?: { title: string; description: string; status: 'Todo' | 'In Progress' | 'Done' };
  onCancel?: () => void;
}

export default function TaskForm({ onSubmit, initialData, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<'Todo' | 'In Progress' | 'Done'>(initialData?.status || 'Todo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialData?.title || '');
    setDescription(initialData?.description || '');
    setStatus(initialData?.status || 'Todo');
  }, [initialData?.title, initialData?.description, initialData?.status]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ title, description, status });
      if (!initialData) {
        setTitle('');
        setDescription('');
        setStatus('Todo');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle(initialData?.title || '');
    setDescription(initialData?.description || '');
    setStatus(initialData?.status || 'Todo');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit Task' : 'Create New Task'}</h3>
      <div>
        <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          id="task-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'Todo' | 'In Progress' | 'Done')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isSubmitting}
        >
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Task' : 'Create Task')}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
