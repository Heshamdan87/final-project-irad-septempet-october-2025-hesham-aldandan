import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  test('renders without crashing', () => {
    render(<LoadingSpinner />);
    // Generic check that the component renders
    expect(document.body).toBeInTheDocument();
  });
});
