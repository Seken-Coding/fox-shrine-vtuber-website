import React from 'react';
import { render, screen } from '@testing-library/react';
import PageTransition from './PageTransition';

describe('PageTransition', () => {
  test('renders children content', () => {
    render(
      <PageTransition>
        <div data-testid="content">Hello</div>
      </PageTransition>
    );
    expect(screen.getByTestId('content')).toHaveTextContent('Hello');
  });
});
