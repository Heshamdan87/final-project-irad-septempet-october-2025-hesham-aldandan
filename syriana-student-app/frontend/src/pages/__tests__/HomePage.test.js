import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';

describe('HomePage', () => {
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    // Generic check that the component renders
    expect(document.body).toBeInTheDocument();
  });
});
