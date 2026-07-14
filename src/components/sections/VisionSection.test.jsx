import React from 'react';
import { render, screen } from '@testing-library/react';
import VisionSection from './VisionSection';

let mockShouldRenderLocalGlows;

jest.mock('../../hooks/useLocalSectionGlowVisibility', () => () =>
  mockShouldRenderLocalGlows,
);

jest.mock('../visuals/FadeoutSection', () => ({ children, ...props }) => (
  <section {...props}>{children}</section>
));

jest.mock('../visuals/BackgroundGlow', () => () => (
  <div data-testid="vision-background-glow" />
));

jest.mock('./VisionSection.module.scss', () => ({}));

describe('VisionSection local glow visibility', () => {
  test('omits only the local glow on reduced viewports', () => {
    mockShouldRenderLocalGlows = false;

    render(<VisionSection />);

    expect(screen.queryByTestId('vision-local-glow')).not.toBeInTheDocument();
    expect(screen.getByTestId('vision-background-glow')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /the new standard of leadership/i,
      }),
    ).toBeInTheDocument();
  });

  test('renders the local glow on wide viewports', () => {
    mockShouldRenderLocalGlows = true;

    render(<VisionSection />);

    expect(screen.getByTestId('vision-local-glow')).toBeInTheDocument();
    expect(screen.getByTestId('vision-background-glow')).toBeInTheDocument();
  });
});
