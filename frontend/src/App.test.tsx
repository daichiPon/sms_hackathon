import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login form', () => {
  render(<App />);
  expect(screen.getByLabelText(/id/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/pw/i)).toBeInTheDocument();
});
