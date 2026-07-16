import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

import HomeSection from './HomeSection';

const { fadeOutSectionSpy, heroFlowLinesSpy } = vi.hoisted(() => ({
  fadeOutSectionSpy: vi.fn(),
  heroFlowLinesSpy: vi.fn(),
}));

vi.mock('../visuals/FadeoutSection', () => ({
  default: (props) => {
    fadeOutSectionSpy(props);

    return (
      <section id={props.id} className={props.className}>
        {props.children}
      </section>
    );
  },
}));

vi.mock('../visuals/HeroFlowLines', () => ({
  default: (props) => {
    heroFlowLinesSpy(props);

    return <div data-testid="hero-flow-lines" />;
  },
}));

describe('HomeSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the hero content and configures its visual layers', () => {
    render(<HomeSection scrollToSection={vi.fn()} />);

    const heading = screen.getByRole('heading', {
      level: 1,
    });

    expect(heading).toHaveTextContent(
      /Your medical.*data.*fused.*for.*peak performance/i
    );

    expect(
      screen.getByText(/We transform complex biometric signals/i)
    ).toBeInTheDocument();

    expect(screen.getByTestId('hero-flow-lines')).toBeInTheDocument();

    expect(fadeOutSectionSpy).toHaveBeenCalledTimes(1);

    const fadeOutProps = fadeOutSectionSpy.mock.calls[0][0];

    expect(fadeOutProps).toEqual(
      expect.objectContaining({
        id: 'home',
        delayPercentage: 0.2,
      })
    );

    expect(heroFlowLinesSpy).toHaveBeenCalledTimes(1);

    expect(heroFlowLinesSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        className: 'flow',
      })
    );
  });

  test('forwards the audit CTA action', async () => {
    const scrollToSection = vi.fn();

    render(<HomeSection scrollToSection={scrollToSection} />);

    await userEvent.click(
      screen.getByRole('button', {
        name: /Secure audit/i,
      })
    );

    expect(scrollToSection).toHaveBeenCalledTimes(1);
    expect(scrollToSection).toHaveBeenCalledWith('audit');
  });
});
