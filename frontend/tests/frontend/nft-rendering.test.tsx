import { render, screen } from '@testing-library/react';
import NFTDisplay from '../../src/components/NFTDisplay';

test('renders NFT display', () => {
  render(<NFTDisplay />);
  expect(screen.getByText(/nft/i)).toBeInTheDocument();
});
