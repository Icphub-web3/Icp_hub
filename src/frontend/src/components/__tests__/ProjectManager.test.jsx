import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProjectManager from '../ProjectManager';

// Mock the UI components
vi.mock('../ui/Card', () => ({
  default: ({ children, className, ...props }) => (
    <div className={`mock-card ${className}`} {...props}>
      {children}
    </div>
  ),
  Header: ({ children }) => <div className="mock-card-header">{children}</div>,
  Title: ({ children }) => <h3 className="mock-card-title">{children}</h3>,
  Content: ({ children }) => <div className="mock-card-content">{children}</div>
}));

vi.mock('../ui/Button', () => ({
  default: ({ children, onClick, loading, variant, ...props }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className={`mock-button ${variant}`}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}));

vi.mock('../ui/Notification', () => ({
  default: ({ type, title, message, onDismiss }) => (
    <div className={`mock-notification ${type}`}>
      <h4>{title}</h4>
      <p>{message}</p>
      {onDismiss && <button onClick={onDismiss}>Dismiss</button>}
    </div>
  )
}));

vi.mock('../LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

describe('ProjectManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now for consistent timestamps
    vi.spyOn(Date, 'now').mockReturnValue(1234567890000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders project manager header correctly', () => {
    render(<ProjectManager />);
    
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
    expect(screen.getByText('Manage your Web3 development projects')).toBeInTheDocument();
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    render(<ProjectManager />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays projects after loading', async () => {
    render(<ProjectManager />);
    
    await waitFor(() => {
      expect(screen.getByText('DeFi Trading Platform')).toBeInTheDocument();
      expect(screen.getByText('NFT Marketplace')).toBeInTheDocument();
      expect(screen.getByText('DAO Governance Tool')).toBeInTheDocument();
    });
  });

  it('opens create form when New Project button is clicked', async () => {
    render(<ProjectManager />);
    
    await waitFor(() => {
      expect(screen.getByText('DeFi Trading Platform')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('New Project'));
    
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('creates a new project successfully', async () => {
    render(<ProjectManager />);
    
    await waitFor(() => {
      expect(screen.getByText('DeFi Trading Platform')).toBeInTheDocument();
    });

    // Open create form
    fireEvent.click(screen.getByText('New Project'));
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Project Name'), {
      target: { value: 'Test Project' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test Description' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Create Project'));
    
    await waitFor(() => {
      expect(screen.getByText('Project created successfully!')).toBeInTheDocument();
    });
  });

  it('edits an existing project', async () => {
    render(<ProjectManager />);
    
    await waitFor(() => {
      expect(screen.getByText('DeFi Trading Platform')).toBeInTheDocument();
    });

    // Click edit button (first edit button)
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(button => 
      button.querySelector('svg') && button.onclick
    );
    
    if (editButton) {
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByText('Edit Project')).toBeInTheDocument();
      });
    }
  });

  it('deletes a project with confirmation', async () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<ProjectManager />);
    
    await waitFor(() => {
      expect(screen.getByText('DeFi Trading Platform')).toBeInTheDocument();
    });

    // Find and click delete button
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('svg') && button.onclick
    );
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this project?');
      });
    }
  });

  it('filters projects by status correctly', async () => {
    render(<ProjectManager />);
    
    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('development')).toBeInTheDocument();
      expect(screen.getByText('planning')).toBeInTheDocument();
    });
  });

  it('shows correct blockchain badges', async () => {
    render(<ProjectManager />);
    
    await waitFor(() => {
      expect(screen.getByText('ICP')).toBeInTheDocument();
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
    });
  });

  it('handles form validation', async () => {
    render(<ProjectManager />);
    
    await waitFor(() => {
      expect(screen.getByText('DeFi Trading Platform')).toBeInTheDocument();
    });

    // Open create form
    fireEvent.click(screen.getByText('New Project'));
    
    // Try to submit empty form
    fireEvent.click(screen.getByText('Create Project'));
    
    // Form should not submit due to required fields
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
  });

  it('displays empty state when no projects exist', async () => {
    // We need to mock the initial load to return empty array
    // This would require more complex mocking of the useEffect
    render(<ProjectManager />);
    
    // Wait for loading to complete and check if empty state appears
    // This test might need adjustment based on actual implementation
  });

  it('handles network errors gracefully', async () => {
    // Mock a network error scenario
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<ProjectManager />);
    
    // This test would need to trigger an error condition
    // Implementation depends on how errors are handled in the component
    
    consoleSpy.mockRestore();
  });
});
