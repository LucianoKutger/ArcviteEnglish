import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createProtocolPointerHandlers } from './protocolPointerHandlers';

const ref = (current) => ({ current });

const createHarness = (overrides = {}) => {
  let x = 0;
  let velocity = 0;
  const dragX = {
    get: vi.fn(() => x),
    getVelocity: vi.fn(() => velocity),
    set: vi.fn((nextX) => {
      x = nextX;
    }),
  };
  const dependencies = {
    activateCard: vi.fn(),
    dragDirectionRef: ref('idle'),
    dragDistanceRef: ref(100),
    dragX,
    finishSettlingSwipe: vi.fn(),
    isDesktop: false,
    pointerStartRef: ref(null),
    releaseSuppressedClick: vi.fn(),
    settleSwipe: vi.fn(),
    suppressClickRef: ref(false),
    suppressClickTimeoutRef: ref(null),
    ...overrides,
  };

  return {
    dependencies,
    handlers: createProtocolPointerHandlers(dependencies),
    setDragState(nextX, nextVelocity = velocity) {
      x = nextX;
      velocity = nextVelocity;
    },
  };
};

const pointerEvent = (overrides = {}) => ({
  button: 0,
  pointerId: 7,
  clientX: 100,
  clientY: 50,
  target: {
    closest: vi.fn(() => null),
  },
  currentTarget: {
    setPointerCapture: vi.fn(),
  },
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  ...overrides,
});

describe('createProtocolPointerHandlers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  test('ignores pointer starts on desktop and non-primary buttons', () => {
    const desktop = createHarness({ isDesktop: true });
    desktop.handlers.handlePointerDown(pointerEvent());
    expect(desktop.dependencies.finishSettlingSwipe).not.toHaveBeenCalled();

    const mobile = createHarness();
    mobile.handlers.handlePointerDown(pointerEvent({ button: 1 }));
    expect(mobile.dependencies.pointerStartRef.current).toBeNull();
  });

  test('starts a mobile card gesture and clears pending click suppression', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const harness = createHarness({ suppressClickTimeoutRef: ref(42) });
    const card = document.createElement('div');
    card.dataset.protocolCardIndex = '3';

    harness.handlers.handlePointerDown(
      pointerEvent({ target: { closest: vi.fn(() => card) } })
    );

    expect(harness.dependencies.finishSettlingSwipe).toHaveBeenCalledTimes(1);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(42);
    expect(harness.dependencies.suppressClickTimeoutRef.current).toBeNull();
    expect(harness.dependencies.pointerStartRef.current).toEqual({
      pointerId: 7,
      x: 100,
      y: 50,
      axis: null,
      cardIndex: 3,
    });
  });

  test('records a null card index for non-card and invalid targets', () => {
    const harness = createHarness();
    const invalidCard = document.createElement('div');
    invalidCard.dataset.protocolCardIndex = 'not-a-number';

    harness.handlers.handlePointerDown(
      pointerEvent({ target: { closest: vi.fn(() => invalidCard) } })
    );
    expect(harness.dependencies.pointerStartRef.current.cardIndex).toBeNull();

    harness.handlers.handlePointerDown(pointerEvent({ target: {} }));
    expect(harness.dependencies.pointerStartRef.current.cardIndex).toBeNull();
  });

  test('ignores unrelated moves and movement below the direction lock', () => {
    const harness = createHarness();
    harness.handlers.handlePointerMove(pointerEvent());

    harness.dependencies.pointerStartRef.current = {
      pointerId: 8,
      x: 100,
      y: 50,
      axis: null,
      cardIndex: null,
    };
    harness.handlers.handlePointerMove(pointerEvent());

    harness.dependencies.pointerStartRef.current.pointerId = 7;
    harness.handlers.handlePointerMove(pointerEvent({ clientX: 96 }));

    expect(harness.dependencies.dragX.set).not.toHaveBeenCalled();
  });

  test('abandons a gesture when vertical movement wins', () => {
    const harness = createHarness();
    harness.handlers.handlePointerDown(pointerEvent());
    harness.handlers.handlePointerMove(
      pointerEvent({ clientX: 95, clientY: 90 })
    );

    expect(harness.dependencies.pointerStartRef.current).toBeNull();
    expect(harness.dependencies.dragX.set).not.toHaveBeenCalled();
  });

  test('locks horizontal gestures and constrains both drag directions', () => {
    const harness = createHarness();
    const nextEvent = pointerEvent({ clientX: -1000 });
    harness.handlers.handlePointerDown(pointerEvent());
    harness.handlers.handlePointerMove(nextEvent);

    expect(nextEvent.currentTarget.setPointerCapture).toHaveBeenCalledWith(7);
    expect(nextEvent.preventDefault).toHaveBeenCalled();
    expect(harness.dependencies.suppressClickRef.current).toBe(true);
    expect(harness.dependencies.dragDirectionRef.current).toBe('next');
    expect(harness.dependencies.dragX.set).toHaveBeenLastCalledWith(-100);

    const previousEvent = pointerEvent({ clientX: 1000 });
    harness.handlers.handlePointerMove(previousEvent);
    expect(harness.dependencies.dragDirectionRef.current).toBe('previous');
    expect(harness.dependencies.dragX.set).toHaveBeenLastCalledWith(100);
  });

  test('activates a tapped card but ignores a tap outside a card', () => {
    const harness = createHarness();
    harness.dependencies.pointerStartRef.current = {
      pointerId: 7,
      axis: null,
      cardIndex: 2,
    };
    harness.handlers.handlePointerUp(pointerEvent());

    expect(harness.dependencies.activateCard).toHaveBeenCalledWith(2);
    expect(harness.dependencies.releaseSuppressedClick).toHaveBeenCalled();

    harness.dependencies.pointerStartRef.current = {
      pointerId: 7,
      axis: null,
      cardIndex: null,
    };
    harness.handlers.handlePointerUp(pointerEvent());
    expect(harness.dependencies.activateCard).toHaveBeenCalledTimes(1);
  });

  test('ignores unrelated releases and settles horizontal pointer-up gestures', () => {
    const desktop = createHarness({ isDesktop: true });
    desktop.handlers.handlePointerUp(pointerEvent());
    expect(desktop.dependencies.settleSwipe).not.toHaveBeenCalled();

    const harness = createHarness();
    harness.dependencies.pointerStartRef.current = {
      pointerId: 8,
      axis: 'horizontal',
      cardIndex: null,
    };
    harness.handlers.handlePointerUp(pointerEvent());
    expect(harness.dependencies.pointerStartRef.current).not.toBeNull();

    harness.dependencies.pointerStartRef.current.pointerId = 7;
    harness.setDragState(-80, 2500);
    harness.handlers.handlePointerUp(pointerEvent());

    expect(harness.dependencies.settleSwipe).toHaveBeenCalledWith(
      'next',
      true,
      2500
    );
    expect(harness.dependencies.releaseSuppressedClick).toHaveBeenCalled();
  });

  test('commits a fast flick and rejects a short slow release', () => {
    const harness = createHarness();
    harness.dependencies.pointerStartRef.current = {
      pointerId: 7,
      axis: 'horizontal',
      cardIndex: null,
    };
    harness.setDragState(25, 900);
    harness.handlers.handlePointerUp(pointerEvent());
    expect(harness.dependencies.settleSwipe).toHaveBeenLastCalledWith(
      'previous',
      true,
      900
    );

    harness.dependencies.pointerStartRef.current = {
      pointerId: 7,
      axis: 'horizontal',
      cardIndex: null,
    };
    harness.setDragState(10, 20);
    harness.handlers.handlePointerUp(pointerEvent());
    expect(harness.dependencies.settleSwipe).toHaveBeenLastCalledWith(
      'previous',
      false,
      20
    );
  });

  test('settles only horizontal pointer cancellations', () => {
    const harness = createHarness();
    harness.handlers.handlePointerCancel();

    harness.dependencies.pointerStartRef.current = { axis: null };
    harness.handlers.handlePointerCancel();
    expect(harness.dependencies.settleSwipe).not.toHaveBeenCalled();

    harness.dependencies.pointerStartRef.current = { axis: 'horizontal' };
    harness.setDragState(-60, 0);
    harness.handlers.handlePointerCancel();
    expect(harness.dependencies.settleSwipe).toHaveBeenCalledWith(
      'next',
      true,
      0
    );
  });

  test('suppresses the synthetic click once and clears its timeout', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const harness = createHarness();
    const ordinaryClick = pointerEvent();
    harness.handlers.handleCarouselClickCapture(ordinaryClick);
    expect(ordinaryClick.preventDefault).not.toHaveBeenCalled();

    harness.dependencies.suppressClickRef.current = true;
    harness.dependencies.suppressClickTimeoutRef.current = 17;
    const suppressedClick = pointerEvent();
    harness.handlers.handleCarouselClickCapture(suppressedClick);

    expect(suppressedClick.preventDefault).toHaveBeenCalled();
    expect(suppressedClick.stopPropagation).toHaveBeenCalled();
    expect(harness.dependencies.suppressClickRef.current).toBe(false);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(17);
    expect(harness.dependencies.suppressClickTimeoutRef.current).toBeNull();
  });
});
