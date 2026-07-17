import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { solutions } from '../../../data/content';
import { createAnimationFrameController } from '../../../test-utils/browserMocks';
import useProtocolCarousel from './useProtocolCarousel';

const { layoutState, motionState } = vi.hoisted(() => ({
  layoutState: {
    isDesktop: false,
  },
  motionState: {
    animations: [],
    listeners: new Set(),
    value: 0,
    velocity: 0,
  },
}));

vi.mock('./useProtocolCarouselLayout', () => ({
  default: (_cardRefs, dragDistanceRef) => {
    dragDistanceRef.current = 100;

    return {
      carouselMaxHeight: 420,
      isDesktop: layoutState.isDesktop,
    };
  },
}));

vi.mock('framer-motion', () => ({
  useMotionValue: (initialValue) => {
    motionState.value = initialValue;

    return {
      get: () => motionState.value,
      getVelocity: () => motionState.velocity,
      set: (nextValue) => {
        motionState.value = nextValue;
        motionState.listeners.forEach((listener) => listener(nextValue));
      },
      on: (_eventName, listener) => {
        motionState.listeners.add(listener);
        return () => motionState.listeners.delete(listener);
      },
    };
  },
  animate: vi.fn((_motionValue, target, options) => {
    const animation = {
      target,
      options,
      completion: null,
      stop: vi.fn(),
      then(callback) {
        this.completion = callback;
        return Promise.resolve();
      },
    };
    motionState.animations.push(animation);
    return animation;
  }),
}));

const renderCarousel = () => {
  const onSelectSolution = vi.fn();
  const hook = renderHook(() => useProtocolCarousel({ onSelectSolution }));
  const grid = document.createElement('div');
  const track = document.createElement('div');

  act(() => {
    hook.result.current.gridRef.current = grid;
    hook.result.current.trackRef.current = track;
  });

  return { ...hook, grid, onSelectSolution, track };
};

const pointerEvent = (overrides = {}) => ({
  button: 0,
  pointerId: 1,
  clientX: 100,
  clientY: 50,
  target: {
    closest: () => null,
  },
  currentTarget: {
    setPointerCapture: vi.fn(),
  },
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  ...overrides,
});

const startHorizontalGesture = (carousel, { endX, velocity = 0 }) => {
  const downEvent = pointerEvent();
  const moveEvent = pointerEvent({ clientX: endX });
  motionState.velocity = velocity;

  act(() => {
    carousel.result.current.handlePointerDown(downEvent);
    carousel.result.current.handlePointerMove(moveEvent);
    carousel.result.current.handlePointerUp(moveEvent);
  });

  return motionState.animations.at(-1);
};

describe('useProtocolCarousel', () => {
  beforeEach(() => {
    layoutState.isDesktop = false;
    motionState.animations.length = 0;
    motionState.listeners.clear();
    motionState.value = 0;
    motionState.velocity = 0;
  });

  test('selects wrapped indices and exposes every carousel card state', () => {
    const carousel = renderCarousel();

    act(() => carousel.result.current.selectActiveIndex(3));

    expect(carousel.result.current.getCardState(3)).toBe('active');
    expect(carousel.result.current.getCardState(2)).toBe('previous');
    expect(carousel.result.current.getCardState(4)).toBe('next');
    expect(carousel.result.current.getCardState(1)).toBe('previousFar');
    expect(carousel.result.current.getCardState(5)).toBe('nextFar');
    expect(carousel.result.current.getCardState(0)).toBe('hidden');
    expect(carousel.result.current.visualIndicatorIndex).toBe(3);

    act(() => carousel.result.current.showNext());
    expect(carousel.result.current.getCardState(4)).toBe('active');

    act(() => carousel.result.current.showPrevious());
    expect(carousel.result.current.getCardState(3)).toBe('active');

    act(() => carousel.result.current.selectActiveIndex(-1));
    expect(carousel.result.current.getCardState(solutions.length - 1)).toBe(
      'active'
    );
  });

  test('selects inactive mobile cards before opening them and opens directly on desktop', () => {
    const carousel = renderCarousel();

    act(() =>
      carousel.result.current.handleCardActivation(solutions[2], 2)
    );
    expect(carousel.onSelectSolution).not.toHaveBeenCalled();
    expect(carousel.result.current.getCardState(2)).toBe('active');

    act(() =>
      carousel.result.current.handleCardActivation(solutions[2], 2)
    );
    expect(carousel.onSelectSolution).toHaveBeenCalledWith(solutions[2]);

    layoutState.isDesktop = true;
    carousel.rerender();
    act(() =>
      carousel.result.current.handleCardActivation(solutions[4], 4)
    );
    expect(carousel.onSelectSolution).toHaveBeenLastCalledWith(solutions[4]);
  });

  test('returns a short swipe to its current card', () => {
    vi.useFakeTimers();
    const carousel = renderCarousel();
    const animation = startHorizontalGesture(carousel, { endX: 80 });

    expect(animation.target).toBe(0);
    expect(animation.options.velocity).toBe(0);

    act(() => animation.completion());

    expect(carousel.result.current.getCardState(0)).toBe('active');
    expect(carousel.grid.dataset.swipeDirection).toBe('idle');
    expect(carousel.grid.dataset.swipeFront).toBe('active');
    expect(carousel.grid.style.getPropertyValue('--swipe-progress')).toBe('0');

    act(() => vi.runAllTimers());
  });

  test('commits next and previous swipes with clamped release velocity', () => {
    vi.useFakeTimers();
    const frames = createAnimationFrameController();
    const carousel = renderCarousel();

    const nextAnimation = startHorizontalGesture(carousel, {
      endX: -1000,
      velocity: 5000,
    });
    expect(nextAnimation.target).toBe(-100);
    expect(nextAnimation.options.velocity).toBe(900);
    act(() => nextAnimation.completion());
    expect(carousel.result.current.getCardState(1)).toBe('active');
    expect(carousel.grid).toHaveAttribute('data-swipe-committing', 'true');

    act(() => frames.runFrames(2));
    expect(carousel.grid).not.toHaveAttribute('data-swipe-committing');

    const previousAnimation = startHorizontalGesture(carousel, {
      endX: 1000,
      velocity: -5000,
    });
    expect(previousAnimation.target).toBe(100);
    expect(previousAnimation.options.velocity).toBe(-900);
    act(() => previousAnimation.completion());
    expect(carousel.result.current.getCardState(0)).toBe('active');
  });

  test('finishes a settling swipe immediately when its incoming card is activated', () => {
    vi.useFakeTimers();
    createAnimationFrameController();
    const carousel = renderCarousel();
    const animation = startHorizontalGesture(carousel, { endX: -1000 });

    act(() =>
      carousel.result.current.handleCardActivation(solutions[1], 1)
    );

    expect(animation.stop).toHaveBeenCalledTimes(1);
    expect(carousel.result.current.getCardState(1)).toBe('active');
    expect(carousel.onSelectSolution).toHaveBeenCalledWith(solutions[1]);

    act(() => animation.completion());
    expect(carousel.result.current.getCardState(1)).toBe('active');
  });

  test('keeps settling when a different card is activated', () => {
    vi.useFakeTimers();
    const carousel = renderCarousel();
    const animation = startHorizontalGesture(carousel, { endX: -1000 });

    act(() =>
      carousel.result.current.handleCardActivation(solutions[3], 3)
    );

    expect(animation.stop).toHaveBeenCalledTimes(1);
    expect(carousel.result.current.getCardState(3)).toBe('active');
    expect(carousel.onSelectSolution).not.toHaveBeenCalled();
  });

  test('stops active work and cancels scheduled cleanup when unmounted', () => {
    vi.useFakeTimers();
    const frames = createAnimationFrameController();
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const carousel = renderCarousel();
    const animation = startHorizontalGesture(carousel, { endX: -1000 });

    act(() => animation.completion());
    expect(frames.pendingFrameCount).toBe(1);

    act(() => {
      carousel.result.current.selectActiveIndex(2);
    });
    expect(frames.cancelAnimationFrameMock).toHaveBeenCalled();

    const pendingAnimation = startHorizontalGesture(carousel, {
      endX: -1000,
    });
    carousel.unmount();

    expect(pendingAnimation.stop).toHaveBeenCalledTimes(1);
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
