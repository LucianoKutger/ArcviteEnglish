import { act, render, screen } from '@testing-library/react';

import { afterEach, beforeEach, vi } from 'vitest';

import FadeOutSection from './FadeoutSection';

const motionState = vi.hoisted(() => ({
  reduced: false,
  mediaMatches: true,
  mediaChangeHandler: null,
  transformSpy: vi.fn(),
  addMediaListenerSpy: vi.fn(),
  removeMediaListenerSpy: vi.fn(),
}));

vi.mock('framer-motion', () => {
  const MotionDiv = ({ children, style = {}, ...props }) => {
    const { opacity, y, transform, ...safeStyle } = style;

    return (
      <div
        {...props}
        style={{
          ...safeStyle,
          ...(typeof opacity === 'number'
            ? {
                opacity,
              }
            : {}),
          ...(typeof transform === 'string'
            ? {
                transform,
              }
            : {}),
        }}
        data-has-motion-opacity={opacity === undefined ? 'false' : 'true'}
        data-has-motion-y={y === undefined ? 'false' : 'true'}
      >
        {children}
      </div>
    );
  };

  return {
    motion: {
      div: MotionDiv,
    },

    useReducedMotion: () => motionState.reduced,

    useScroll: () => ({
      scrollY: 'scroll-y-value',
    }),

    useTransform: (...args) => {
      motionState.transformSpy(...args);

      return {
        transformation: args,
      };
    },
  };
});

const TestGlow = () => <div>Component glow</div>;

describe('FadeOutSection', () => {
  let originalScrollYDescriptor;

  beforeEach(() => {
    motionState.reduced = false;
    motionState.mediaMatches = true;
    motionState.mediaChangeHandler = null;

    vi.clearAllMocks();

    originalScrollYDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'scrollY'
    );

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 20,
    });

    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 0,
      right: 1000,
      bottom: 500,
      width: 1000,
      height: 400,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn(() => ({
        matches: motionState.mediaMatches,
        media: '(min-width: 1024px)',
        onchange: null,

        addEventListener: vi.fn((eventName, handler) => {
          motionState.addMediaListenerSpy(eventName, handler);

          motionState.mediaChangeHandler = handler;
        }),

        removeEventListener: vi.fn((eventName, handler) => {
          motionState.removeMediaListenerSpy(eventName, handler);
        }),

        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalScrollYDescriptor) {
      Object.defineProperty(window, 'scrollY', originalScrollYDescriptor);
    } else {
      delete window.scrollY;
    }
  });

  test('separates background and content children into motion layers', () => {
    render(
      <FadeOutSection id="test-section" className="test-section">
        <TestGlow />
        <div className="background-effect">Class background</div>
        <div>Regular content</div>
        Plain text
      </FadeOutSection>
    );

    const section = document.getElementById('test-section');

    expect(section).toHaveClass('test-section');

    const backgroundLayer = section.querySelector(
      '[data-motion-layer="background"]'
    );

    const contentLayer = section.querySelector('[data-motion-layer="content"]');

    expect(backgroundLayer).toHaveTextContent('Component glow');

    expect(backgroundLayer).toHaveTextContent('Class background');

    expect(contentLayer).toHaveTextContent('Regular content');

    expect(contentLayer).toHaveTextContent('Plain text');

    expect(backgroundLayer).toHaveAttribute('data-has-motion-opacity', 'true');

    expect(contentLayer).toHaveAttribute('data-has-motion-y', 'true');

    expect(
      section.querySelector('[data-motion-layer="overlay"]')
    ).toBeInTheDocument();

    expect(motionState.transformSpy).toHaveBeenCalled();
  });

  test('keeps all layers static when reduced motion is active', () => {
    motionState.reduced = true;

    render(
      <FadeOutSection id="reduced-section">
        <TestGlow />
        <div>Static content</div>
      </FadeOutSection>
    );

    const section = document.getElementById('reduced-section');

    const backgroundLayer = section.querySelector(
      '[data-motion-layer="background"]'
    );

    const contentLayer = section.querySelector('[data-motion-layer="content"]');

    expect(backgroundLayer).toHaveStyle({
      transform: 'none',
    });

    expect(contentLayer).toHaveStyle({
      transform: 'none',
    });

    expect(backgroundLayer).toHaveAttribute('data-has-motion-opacity', 'false');

    expect(contentLayer).toHaveAttribute('data-has-motion-y', 'false');

    expect(
      section.querySelector('[data-motion-layer="overlay"]')
    ).not.toBeInTheDocument();
  });

  test('reacts to the desktop media query and removes listeners', () => {
    const windowRemoveListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <FadeOutSection id="responsive-section">
        <div>Responsive content</div>
      </FadeOutSection>
    );

    const section = document.getElementById('responsive-section');

    expect(
      section.querySelector('[data-motion-layer="overlay"]')
    ).toBeInTheDocument();

    expect(motionState.mediaChangeHandler).toEqual(expect.any(Function));

    act(() => {
      motionState.mediaChangeHandler({
        matches: false,
      });
    });

    expect(
      section.querySelector('[data-motion-layer="overlay"]')
    ).not.toBeInTheDocument();

    unmount();

    expect(motionState.removeMediaListenerSpy).toHaveBeenCalledWith(
      'change',
      motionState.mediaChangeHandler
    );

    expect(windowRemoveListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });
});
