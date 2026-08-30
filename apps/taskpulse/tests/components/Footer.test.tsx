import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer Component', () => {
  it('renders footer element', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('renders the TaskPulse logo and brand name', () => {
    render(<Footer />);
    expect(screen.getByText('TaskPulse')).toBeInTheDocument();
  });

  it('renders product link section heading and feature link', () => {
    render(<Footer />);
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
  });

  it('renders resource section heading', () => {
    render(<Footer />);
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });

  it('renders company section heading', () => {
    render(<Footer />);
    expect(screen.getByText('Company')).toBeInTheDocument();
  });

  it('renders copyright with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} TaskPulse. All rights reserved.`)).toBeInTheDocument();
  });

  it('renders section headings with uppercase styling', () => {
    render(<Footer />);
    expect(screen.getByText('Product')).toHaveClass('uppercase');
  });

  it('renders social media links', () => {
    render(<Footer />);
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
  });

  it('has dark background styling', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-surface-900');
  });

  it('has responsive grid layout', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    const gridContainer = footer.querySelector('[class*="grid"]');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('sm:grid-cols-2');
    expect(gridContainer).toHaveClass('lg:grid-cols-5');
  });

  it('links TaskPulse to home page', () => {
    render(<Footer />);
    const link = screen.getByText('TaskPulse').closest('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders footer description text', () => {
    render(<Footer />);
    expect(screen.getByText(/Streamline your workflow/i)).toBeInTheDocument();
  });
});
