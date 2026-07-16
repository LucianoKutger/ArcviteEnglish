import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createMatchMediaController } from '../../test-utils/browserMocks';
import { methodologySegments } from '../../data/content';
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

const presenceMocks = vi.hoisted(() => {
  let latestExitComplete = null;

  return {
    registerExitComplete(callback) {
      latestExitComplete = callback;
    },

    completeExit() {
      if (typeof latestExitComplete !== 'function') {
        throw new Error(
          'No AnimatePresence exit callback has been registered.'
        );
      }

      latestExitComplete();
    },

    reset() {
      latestExitComplete = null;
    },
  };
});

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
      span: createMotionComponent('span'),
    },

    AnimatePresence: ({ children, onExitComplete }) => {
      presenceMocks.registerExitComplete(onExitComplete);

      return children;
    },

    useAnimationControls: animationMocks.getNextControl,
  };
});

const [coreSegment, neuroSegment, operationalSegment, dreamSegment] =
  methodologySegments;

const getSegmentItem = (title) =>
  screen.getByRole('button', {
    name: new RegExp(title, 'i'),
  });

const getTextWrapper = () =>
  getSegmentItem('Dream').parentElement.parentElement.parentElement;

const completeExit = () => {
  act(() => {
    presenceMocks.completeExit();
  });
};

const getCenterGroup = () => screen.getByText('YOU').closest('g');

const getArcGroups = (container) =>
  Array.from(container.querySelectorAll('svg path[fill="transparent"]')).map(
    (path) => path.closest('g')
  );

describe('MethodologySystem viewport animations', () => {
  beforeEach(() => {
    animationMocks.reset();
    presenceMocks.reset();
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

describe('MethodologySystem segment interactions', () => {
  beforeEach(() => {
    animationMocks.reset();
    presenceMocks.reset();
  });

  test('opens desktop content immediately when a segment is hovered', () => {
    createMatchMediaController(1280);

    render(<MethodologySystem />);

    expect(screen.queryByText(coreSegment.description)).not.toBeInTheDocument();

    fireEvent.mouseEnter(getSegmentItem(coreSegment.title));

    expect(screen.getByText(coreSegment.description)).toBeInTheDocument();

    coreSegment.listItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();

      expect(screen.getByText(item.text)).toBeInTheDocument();
    });
  });

  test('waits for the current desktop content to exit before opening the next segment', () => {
    createMatchMediaController(1280);

    render(<MethodologySystem />);

    fireEvent.mouseEnter(getSegmentItem(coreSegment.title));

    expect(screen.getByText(coreSegment.description)).toBeInTheDocument();

    fireEvent.mouseEnter(getSegmentItem(neuroSegment.title));

    expect(screen.queryByText(coreSegment.description)).not.toBeInTheDocument();

    expect(
      screen.queryByText(neuroSegment.description)
    ).not.toBeInTheDocument();

    completeExit();

    expect(screen.getByText(neuroSegment.description)).toBeInTheDocument();
  });

  test('opens only the latest segment during a rapid desktop A to B to C switch', () => {
    createMatchMediaController(1280);

    render(<MethodologySystem />);

    fireEvent.mouseEnter(getSegmentItem(coreSegment.title));

    fireEvent.mouseEnter(getSegmentItem(neuroSegment.title));

    fireEvent.mouseEnter(getSegmentItem(operationalSegment.title));

    expect(screen.queryByText(coreSegment.description)).not.toBeInTheDocument();

    expect(
      screen.queryByText(neuroSegment.description)
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(operationalSegment.description)
    ).not.toBeInTheDocument();

    completeExit();

    expect(
      screen.getByText(operationalSegment.description)
    ).toBeInTheDocument();

    expect(
      screen.queryByText(neuroSegment.description)
    ).not.toBeInTheDocument();
  });

  test('does not reopen pending content after leaving the desktop interaction area', () => {
    createMatchMediaController(1280);

    render(<MethodologySystem />);

    fireEvent.mouseEnter(getSegmentItem(coreSegment.title));

    fireEvent.mouseEnter(getSegmentItem(neuroSegment.title));

    fireEvent.mouseLeave(getTextWrapper());

    completeExit();

    expect(screen.queryByText(coreSegment.description)).not.toBeInTheDocument();

    expect(
      screen.queryByText(neuroSegment.description)
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(operationalSegment.description)
    ).not.toBeInTheDocument();
  });

  test('opens and closes segments through clicks on mobile', () => {
    createMatchMediaController(390);

    render(<MethodologySystem />);

    fireEvent.mouseEnter(getSegmentItem(coreSegment.title));

    expect(screen.queryByText(coreSegment.description)).not.toBeInTheDocument();

    fireEvent.click(getSegmentItem(coreSegment.title));

    expect(screen.getByText(coreSegment.description)).toBeInTheDocument();

    fireEvent.click(getSegmentItem(coreSegment.title));

    expect(screen.queryByText(coreSegment.description)).not.toBeInTheDocument();

    completeExit();

    fireEvent.click(getSegmentItem(neuroSegment.title));

    expect(screen.getByText(neuroSegment.description)).toBeInTheDocument();
  });

  test('uses only the latest pending selection during rapid mobile clicks', () => {
    createMatchMediaController(390);

    render(<MethodologySystem />);

    fireEvent.click(getSegmentItem(coreSegment.title));

    expect(screen.getByText(coreSegment.description)).toBeInTheDocument();

    fireEvent.click(getSegmentItem(neuroSegment.title));

    fireEvent.click(getSegmentItem(operationalSegment.title));

    expect(screen.queryByText(coreSegment.description)).not.toBeInTheDocument();

    expect(
      screen.queryByText(neuroSegment.description)
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(operationalSegment.description)
    ).not.toBeInTheDocument();

    completeExit();

    expect(
      screen.getByText(operationalSegment.description)
    ).toBeInTheDocument();

    expect(
      screen.queryByText(neuroSegment.description)
    ).not.toBeInTheDocument();
  });

  test('resets the active segment when switching between viewport modes', () => {
    const mediaController = createMatchMediaController(390);

    render(<MethodologySystem />);

    const coreButton = getSegmentItem(coreSegment.title);

    fireEvent.click(coreButton);

    expect(screen.getByText(coreSegment.description)).toBeInTheDocument();

    expect(coreButton).toHaveAttribute('aria-expanded', 'true');

    act(() => {
      mediaController.setWidth(1280);
    });

    expect(screen.queryByText(coreSegment.description)).not.toBeInTheDocument();

    expect(coreButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.mouseEnter(getSegmentItem(neuroSegment.title));

    expect(screen.getByText(neuroSegment.description)).toBeInTheDocument();
  });

  test('handles entering and leaving the YOU center without activating content', () => {
    createMatchMediaController(1280);

    render(<MethodologySystem />);

    const centerGroup = getCenterGroup();

    expect(centerGroup).not.toBeNull();

    fireEvent.mouseEnter(centerGroup);

    expect(screen.queryByRole('region')).not.toBeInTheDocument();

    fireEvent.mouseLeave(centerGroup);

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  test('opens a segment through its SVG arc on desktop', () => {
    createMatchMediaController(1280);

    const { container } = render(<MethodologySystem />);

    const [coreArc] = getArcGroups(container);

    expect(coreArc).not.toBeNull();

    fireEvent.mouseEnter(coreArc);

    expect(screen.getByText(coreSegment.description)).toBeInTheDocument();
  });

  test('opens and closes a segment through its SVG arc on mobile', () => {
    createMatchMediaController(390);

    const { container } = render(<MethodologySystem />);

    const [coreArc] = getArcGroups(container);

    expect(coreArc).not.toBeNull();

    fireEvent.click(coreArc);

    expect(screen.getByText(coreSegment.description)).toBeInTheDocument();

    fireEvent.click(coreArc);

    expect(screen.queryByText(coreSegment.description)).not.toBeInTheDocument();

    completeExit();
  });

  test('renders the Dream segment without a details list', () => {
    createMatchMediaController(1280);

    render(<MethodologySystem />);

    fireEvent.mouseEnter(getSegmentItem(dreamSegment.title));

    expect(screen.getByText(dreamSegment.description)).toBeInTheDocument();

    const region = screen.getByRole('region', {
      name: dreamSegment.title,
    });

    expect(region.querySelectorAll('p')).toHaveLength(1);
  });
});

describe('MethodologySystem accessibility', () => {
  beforeEach(() => {
    animationMocks.reset();
    presenceMocks.reset();
  });

  test('ignores unrelated keyboard input', () => {
    createMatchMediaController(1280);

    render(<MethodologySystem />);

    const coreButton = getSegmentItem(coreSegment.title);

    coreButton.focus();

    fireEvent.keyDown(coreButton, {
      key: 'ArrowDown',
      code: 'ArrowDown',
    });

    expect(coreButton).toHaveFocus();

    expect(coreButton).toHaveAttribute('aria-expanded', 'false');

    expect(screen.queryByText(coreSegment.description)).not.toBeInTheDocument();
  });

  test('exposes every text segment as a native button with ARIA state', () => {
    createMatchMediaController(1280);

    const { container } = render(<MethodologySystem />);

    methodologySegments.forEach((segment) => {
      const button = getSegmentItem(segment.title);

      expect(button.tagName).toBe('BUTTON');

      expect(button).toHaveAttribute('type', 'button');

      expect(button).toHaveAttribute('aria-expanded', 'false');

      expect(button).toHaveAttribute(
        'aria-controls',
        `methodology-content-${segment.id}`
      );
    });

    const visualGraph = container.querySelector('svg');

    expect(visualGraph).toHaveAttribute('aria-hidden', 'true');

    expect(visualGraph).toHaveAttribute('focusable', 'false');
  });

  test('opens a desktop segment with Enter and exposes a labelled region', () => {
    createMatchMediaController(1280);

    render(<MethodologySystem />);

    const coreButton = getSegmentItem(coreSegment.title);

    coreButton.focus();

    fireEvent.keyDown(coreButton, {
      key: 'Enter',
      code: 'Enter',
    });

    expect(coreButton).toHaveFocus();

    expect(coreButton).toHaveAttribute('aria-expanded', 'true');

    const region = screen.getByRole('region', {
      name: coreSegment.title,
    });

    expect(region).toHaveAttribute(
      'id',
      `methodology-content-${coreSegment.id}`
    );

    expect(region).toHaveAttribute(
      'aria-labelledby',
      `methodology-title-${coreSegment.id}`
    );

    fireEvent.keyDown(coreButton, {
      key: 'Escape',
      code: 'Escape',
    });

    expect(coreButton).toHaveAttribute('aria-expanded', 'false');

    expect(screen.queryByText(coreSegment.description)).not.toBeInTheDocument();

    completeExit();
  });

  test('opens and closes a mobile segment with the Space key', () => {
    createMatchMediaController(390);

    render(<MethodologySystem />);

    const coreButton = getSegmentItem(coreSegment.title);

    coreButton.focus();

    fireEvent.keyDown(coreButton, {
      key: ' ',
      code: 'Space',
    });

    expect(coreButton).toHaveAttribute('aria-expanded', 'true');

    expect(screen.getByText(coreSegment.description)).toBeInTheDocument();

    fireEvent.keyDown(coreButton, {
      key: ' ',
      code: 'Space',
    });

    expect(coreButton).toHaveAttribute('aria-expanded', 'false');

    expect(screen.queryByText(coreSegment.description)).not.toBeInTheDocument();

    completeExit();
  });
});
