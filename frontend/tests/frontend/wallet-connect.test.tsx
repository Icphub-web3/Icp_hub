import { render, screen } from '@testing-library/react';
import WalletConnect from '../../src/components/WalletConnect';

test('renders wallet connect button', () => {
  render(<WalletConnect />);
  expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
});
