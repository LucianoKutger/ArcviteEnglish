import { act, render, screen } from '@testing-library/react';

import { afterEach, beforeEach, vi } from 'vitest';

import { createIntersectionObserverController } from '../../test-utils/browserMocks';
import FadeOutSection from './FadeoutSection';

const motionState = vi.hoisted(() => ({
  reduced: false,
  mediaMatches: true,
  mediaChangeHandler: null,
  scrollValue: 20,
  scrollListeners: new Set(),
  useScrollSpy: vi.fn(),
  unsubscribeSpy: vi.fn(),
  addMediaListenerSpy: vi.fn(),
  removeMediaListenerSpy: vi.fn(),
}));

vi.mock('framer-motion', () => {
  return {
    useReducedMotion: () => motionState.reduced,
    useScroll: () => {
      motionState.useScrollSpy();

      return {
        scrollY: {
          get: () => motionState.scrollValue,
          on: (eventName, listener) => {
            motionState.scrollListeners.add(listener);

            return () => {
              motionState.scrollListeners.delete(listener);
              motionState.unsubscribeSpy(eventName);
            };
          },
        },
      };
    },
  };
});

const TestGlow = () => <div>Component glow</div>;

describe('FadeOutSection', () => {
  let originalScrollYDescriptor;
  let intersectionController;

  beforeEach(() => {
    motionState.reduced = false;
    motionState.mediaMatches = true;
    motionState.mediaChangeHandler = null;
    motionState.scrollValue = 20;
    motionState.scrollListeners.clear();

    vi.clearAllMocks();
    intersectionController = createIntersectionObserverController();

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

  test('separates background and content children into viewport-gated layers', () => {
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

    expect(section).toHaveAttribute('data-scroll-tracking', 'active');
    expect(backgroundLayer).toHaveStyle({ opacity: '1' });
    expect(contentLayer).toHaveStyle({
      opacity: '1',
      transform: 'translate3d(0, 0.00px, 0)',
    });

    expect(
      section.querySelector('[data-motion-layer="overlay"]')
    ).toBeInTheDocument();

    expect(motionState.useScrollSpy).toHaveBeenCalled();
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

    expect(section).toHaveAttribute('data-scroll-tracking', 'paused');

    expect(
      section.querySelector('[data-motion-layer="overlay"]')
    ).not.toBeInTheDocument();

    expect(motionState.useScrollSpy).not.toHaveBeenCalled();
  });

  test('unsubscribes from scroll updates outside the viewport margin', () => {
    render(
      <FadeOutSection id="gated-section">
        <div>Gated content</div>
      </FadeOutSection>
    );

    const section = document.getElementById('gated-section');
    const observer = intersectionController.latestObserver;

    expect(section).toHaveAttribute('data-scroll-tracking', 'active');
    expect(observer.options).toEqual({
      rootMargin: '50% 0px',
      threshold: 0,
    });

    act(() => {
      observer.setIsIntersecting(false);
    });

    expect(section).toHaveAttribute('data-scroll-tracking', 'paused');
    expect(motionState.unsubscribeSpy).toHaveBeenCalledWith('change');
    expect(motionState.scrollListeners.size).toBe(0);
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
