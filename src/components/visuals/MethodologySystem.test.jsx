import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createMatchMediaController } from '../../test-utils/browserMocks';

import MethodologySystem from './MethodologySystem';

const animationMocks = vi.hoisted(() => {
  let controlIndex = 0;

  const impactControls = {
    start: vi.fn(),
    stop: vi.fn(),
  };

  const polarControls = {
    start: vi.fn(),
    stop: vi.fn(),
  };

  const viewportState = {
    targetRef: {
      current: null,
    },
    isActive: true,
  };

  return {
    impactControls,
    polarControls,
    viewportState,

    getNextControl() {
      const control = controlIndex % 2 === 0 ? impactControls : polarControls;

      controlIndex += 1;

      return control;
    },

    reset() {
      controlIndex = 0;

      viewportState.targetRef.current = null;
      viewportState.isActive = true;

      impactControls.start.mockReset();
      impactControls.stop.mockReset();

      polarControls.start.mockReset();
      polarControls.stop.mockReset();
    },
  };
});

vi.mock('../../hooks/useViewportActivity', () => ({
  default: () => animationMocks.viewportState,
}));

vi.mock('framer-motion', async () => {
  const React = await vi.importActual('react');

  const ignoredMotionProps = new Set([
    'animate',
    'initial',
    'exit',
    'transition',
    'whileHover',
    'whileTap',
    'variants',
    'layout',
    'layoutId',
  ]);

  const createMotionComponent = (tagName) =>
    React.forwardRef(function MockMotionComponent(props, ref) {
      const domProps = {};

      Object.entries(props).forEach(([key, value]) => {
        if (!ignoredMotionProps.has(key)) {
          domProps[key] = value;
        }
      });

      return React.createElement(tagName, {
        ...domProps,
        ref,
      });
    });

  return {
    motion: {
      div: createMotionComponent('div'),
      h2: createMotionComponent('h2'),
      path: createMotionComponent('path'),
      line: createMotionComponent('line'),
      circle: createMotionComponent('circle'),
    },

    AnimatePresence: ({ children }) => children,

    useAnimationControls: animationMocks.getNextControl,
  };
});

describe('MethodologySystem viewport animations', () => {
  beforeEach(() => {
    animationMocks.reset();
  });

  test('starts both continuous animations while the component is active', () => {
    createMatchMediaController(1280);

    const { container } = render(<MethodologySystem />);

    expect(animationMocks.viewportState.targetRef.current).toBe(
      container.firstElementChild
    );

    expect(animationMocks.impactControls.start).toHaveBeenCalledTimes(1);

    expect(animationMocks.impactControls.start).toHaveBeenCalledWith(
      expect.objectContaining({
        pathOffset: [-0.15, 1],
        opacity: [0.5, 1, 0.5],
        strokeWidth: [2, 6, 2],
        transition: expect.objectContaining({
          pathOffset: expect.objectContaining({
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }),
        }),
      })
    );

    expect(animationMocks.polarControls.start).toHaveBeenCalledTimes(1);

    expect(animationMocks.polarControls.start).toHaveBeenCalledWith({
      r: 14,
      opacity: 0,
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeOut',
      },
    });

    expect(animationMocks.impactControls.stop).not.toHaveBeenCalled();

    expect(animationMocks.polarControls.stop).not.toHaveBeenCalled();
  });

  test('does not start the animations while the component is inactive', () => {
    createMatchMediaController(1280);

    animationMocks.viewportState.isActive = false;

    render(<MethodologySystem />);

    expect(animationMocks.impactControls.start).not.toHaveBeenCalled();

    expect(animationMocks.polarControls.start).not.toHaveBeenCalled();

    expect(animationMocks.impactControls.stop).toHaveBeenCalledTimes(1);

    expect(animationMocks.polarControls.stop).toHaveBeenCalledTimes(1);
  });

  test('stops active animations outside the viewport and restarts them after returning', () => {
    createMatchMediaController(1280);

    const { rerender } = render(<MethodologySystem />);

    expect(animationMocks.impactControls.start).toHaveBeenCalledTimes(1);

    expect(animationMocks.polarControls.start).toHaveBeenCalledTimes(1);

    animationMocks.viewportState.isActive = false;

    rerender(<MethodologySystem />);

    // Ein Stop erfolgt beim Cleanup des aktiven Effekts.
    // Der zweite Stop erfolgt im neuen inaktiven Effekt.
    expect(animationMocks.impactControls.stop).toHaveBeenCalledTimes(2);

    expect(animationMocks.polarControls.stop).toHaveBeenCalledTimes(2);

    animationMocks.viewportState.isActive = true;

    rerender(<MethodologySystem />);

    expect(animationMocks.impactControls.start).toHaveBeenCalledTimes(2);

    expect(animationMocks.polarControls.start).toHaveBeenCalledTimes(2);
  });

  test('stops both animations when the active component is unmounted', () => {
    createMatchMediaController(1280);

    const { unmount } = render(<MethodologySystem />);

    expect(animationMocks.impactControls.start).toHaveBeenCalledTimes(1);

    expect(animationMocks.polarControls.start).toHaveBeenCalledTimes(1);

    unmount();

    expect(animationMocks.impactControls.stop).toHaveBeenCalledTimes(1);

    expect(animationMocks.polarControls.stop).toHaveBeenCalledTimes(1);
  });

  test('registers and removes the desktop media-query listener', () => {
    const mediaController = createMatchMediaController(1280);

    const { unmount } = render(<MethodologySystem />);

    expect(mediaController.mediaQueries).toHaveLength(1);

    const mediaQuery = mediaController.mediaQueries[0];

    expect(mediaQuery.media).toBe('(min-width: 1024px)');

    expect(mediaQuery.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );

    const registeredHandler = mediaQuery.addEventListener.mock.calls[0][1];

    unmount();

    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
      'change',
      registeredHandler
    );
  });
});
