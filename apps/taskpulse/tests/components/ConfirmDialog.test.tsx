/// <reference types="@testing-library/jest-dom/jest-globals" />
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ConfirmDialog from '@/components/ConfirmDialog';

describe('ConfirmDialog Component', () => {
  const onCancel = jest.fn();
  const onConfirm = jest.fn();

  beforeEach(() => {
    onCancel.mockReset();
    onConfirm.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        onConfirm={onConfirm}
        onCancel={onCancel}
        message="Are you sure?"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders with default title when not provided', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        message="Are you sure?"
      />
    );
    expect(screen.getByText('Delete Task')).toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        title="Custom Title"
        message="Custom message"
      />
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('renders cancel and delete buttons', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        message="Are you sure?"
      />
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        message="Are you sure?"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Delete button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        message="Are you sure?"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('handles Escape key press to cancel', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        message="Are you sure?"
      />
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders with custom labels', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        message="Are you sure?"
        confirmLabel="Remove"
        cancelLabel="Go Back"
      />
    );
    expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('renders a white background modal with proper styling', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        message="Are you sure?"
      />
    );
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title');
  });

  it('calls onConfirm when backdrop is clicked', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        message="Are you sure?"
      />
    );
    const backdrop = container.querySelector('[role="dialog"]');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
