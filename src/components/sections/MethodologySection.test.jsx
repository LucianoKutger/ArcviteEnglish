import React from 'react';
import { render, screen } from '@testing-library/react';
import MethodologySection from './MethodologySection';

let mockShouldRenderLocalGlows;

jest.mock('../../hooks/useLocalSectionGlowVisibility', () => () =>
  mockShouldRenderLocalGlows,
);

jest.mock('../visuals/FadeoutSection', () => ({ children, ...props }) => (
  <section {...props}>{children}</section>
));

jest.mock('../visuals/MethodologySystem', () => () => (
  <div data-testid="methodology-system" />
));

jest.mock('./MethodologySection.module.scss', () => ({}));

describe('MethodologySection local glow visibility', () => {
  test('omits only the local glow on reduced viewports', () => {
    mockShouldRenderLocalGlows = false;

    render(<MethodologySection />);

    expect(
      screen.queryByTestId('methodology-local-glow'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('methodology-system')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /the arc system/i }),
    ).toBeInTheDocument();
  });

  test('renders the local glow on wide viewports', () => {
    mockShouldRenderLocalGlows = true;

    render(<MethodologySection />);

    expect(screen.getByTestId('methodology-local-glow')).toBeInTheDocument();
    expect(screen.getByTestId('methodology-system')).toBeInTheDocument();
  });
});
