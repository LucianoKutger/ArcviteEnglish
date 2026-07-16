import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import styles from './BackgroundGlow.module.scss';
import BackgroundGlow from './BackgroundGlow';

const { viewportActivity } = vi.hoisted(() => ({
  viewportActivity: {
    targetRef: {
      current: null,
    },
    isActive: true,
  },
}));

vi.mock('../../hooks/useViewportActivity', () => ({
  default: () => viewportActivity,
}));

describe('BackgroundGlow', () => {
  beforeEach(() => {
    viewportActivity.targetRef.current = null;
    viewportActivity.isActive = true;
  });

  test('renders the selected variant, custom class and ambient glow elements', () => {
    const { container } = render(
      <BackgroundGlow variant="founder" className="custom-glow" />
    );

    const glowLayer = container.firstElementChild;

    expect(glowLayer).toBeInstanceOf(HTMLElement);

    expect(glowLayer).toHaveClass(
      styles.backgroundGlowLayer,
      styles.founder,
      'custom-glow'
    );

    expect(glowLayer).not.toHaveClass(styles.animationsPaused);

    expect(viewportActivity.targetRef.current).toBe(glowLayer);

    expect(container.querySelector(`.${styles.bgGlow}`)).toBeInTheDocument();

    const ambientOrbs = container.querySelectorAll(`.${styles.ambientOrb}`);

    expect(ambientOrbs).toHaveLength(3);

    expect(ambientOrbs[0]).toHaveClass(styles.ambientOrb, styles.orb1);

    expect(ambientOrbs[1]).toHaveClass(styles.ambientOrb, styles.orb2);

    expect(ambientOrbs[2]).toHaveClass(styles.ambientOrb, styles.orb3);
  });

  test('adds the paused animation class when the element is inactive', () => {
    viewportActivity.isActive = false;

    const { container } = render(<BackgroundGlow variant="vision" />);

    const glowLayer = container.firstElementChild;

    expect(glowLayer).toHaveClass(
      styles.backgroundGlowLayer,
      styles.vision,
      styles.animationsPaused
    );
  });

  test('falls back to the study variant for an unknown variant', () => {
    const { container } = render(<BackgroundGlow variant="unknown-variant" />);

    const glowLayer = container.firstElementChild;

    expect(glowLayer).toHaveClass(styles.backgroundGlowLayer, styles.study);

    expect(glowLayer).not.toHaveClass(
      styles.vision,
      styles.founder,
      styles.animationsPaused
    );
  });

  test('uses the study variant by default', () => {
    const { container } = render(<BackgroundGlow />);

    const glowLayer = container.firstElementChild;

    expect(glowLayer).toHaveClass(styles.backgroundGlowLayer, styles.study);
  });
});
