import React from 'react';
import { render, screen } from '@testing-library/react';
import VisionSection from './VisionSection';
import { vi } from 'vitest';

let mockShouldRenderLocalGlows;

vi.mock('../../hooks/useLocalSectionGlowVisibility', () => ({
  default: () => mockShouldRenderLocalGlows,
}));

vi.mock('../visuals/FadeoutSection', () => ({
  default: ({ children, ...props }) => <section {...props}>{children}</section>,
}));

vi.mock('../visuals/BackgroundGlow', () => ({
  default: () => <div data-testid="vision-background-glow" />,
}));

vi.mock('./VisionSection.module.scss', () => ({
  default: {},
}));

describe('VisionSection local glow visibility', () => {
  test('omits only the local glow on reduced viewports', () => {
    mockShouldRenderLocalGlows = false;

    render(<VisionSection />);

    expect(screen.queryByTestId('vision-local-glow')).not.toBeInTheDocument();
    expect(screen.getByTestId('vision-background-glow')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /the new standard of leadership/i,
      })
    ).toBeInTheDocument();
  });

  test('renders the local glow on wide viewports', () => {
    mockShouldRenderLocalGlows = true;

    render(<VisionSection />);

    expect(screen.getByTestId('vision-local-glow')).toBeInTheDocument();
    expect(screen.getByTestId('vision-background-glow')).toBeInTheDocument();
  });
});
