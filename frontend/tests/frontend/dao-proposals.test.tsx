import { render, screen } from '@testing-library/react';
import DaoProposals from '../../src/components/DaoProposals';

test('renders DAO proposals', () => {
  render(<DaoProposals />);
  expect(screen.getByText(/proposals/i)).toBeInTheDocument();
});
