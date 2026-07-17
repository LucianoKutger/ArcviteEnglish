import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import useProtocolCarouselLayout from './useProtocolCarouselLayout';

const createCard = ({ height, width }) => {
  const card = document.createElement('div');
  Object.defineProperties(card, {
    offsetHeight: { configurable: true, value: height },
    offsetWidth: { configurable: true, value: width },
  });
  return card;
};

const renderLayout = ({ cards = [], dragDistance = 1 } = {}) => {
  const cardRefs = { current: cards };
  const dragDistanceRef = { current: dragDistance };
  const hook = renderHook(() =>
    useProtocolCarouselLayout(cardRefs, dragDistanceRef)
  );

  return { ...hook, cardRefs, dragDistanceRef };
};

describe('useProtocolCarouselLayout', () => {
  test('falls back to window width and resize events without matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);
    vi.stubGlobal('ResizeObserver', undefined);
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 800,
    });

    const { result, unmount } = renderLayout();
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.carouselMaxHeight).toBeNull();

    act(() => {
      window.innerWidth = 1280;
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.isDesktop).toBe(true);

    const resizeHandler = addSpy.mock.calls.find(
      ([eventName]) => eventName === 'resize'
    )[1];
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', resizeHandler);
  });

  test('subscribes to modern media-query changes and resets desktop height', () => {
    let changeHandler;
    const mediaQuery = {
      matches: true,
      addEventListener: vi.fn((_eventName, handler) => {
        changeHandler = handler;
      }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));

    const { result, unmount } = renderLayout({
      cards: [createCard({ height: 280, width: 320 })],
    });

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.carouselMaxHeight).toBeNull();
    expect(mediaQuery.addEventListener).toHaveBeenCalledWith(
      'change',
      changeHandler
    );

    act(() => changeHandler({ matches: false }));
    expect(result.current.isDesktop).toBe(false);

    unmount();
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
      'change',
      changeHandler
    );
  });

  test('supports legacy media-query listeners and observes mobile card sizes', () => {
    let changeHandler;
    const mediaQuery = {
      matches: false,
      addListener: vi.fn((handler) => {
        changeHandler = handler;
      }),
      removeListener: vi.fn(),
    };
    const observerState = {
      callback: null,
      disconnect: vi.fn(),
      observe: vi.fn(),
    };
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));
    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(function ResizeObserver(callback) {
        observerState.callback = callback;
        this.observe = observerState.observe;
        this.disconnect = observerState.disconnect;
      })
    );
    const cards = [
      createCard({ height: 240, width: 300 }),
      createCard({ height: 360, width: 280 }),
      null,
    ];

    const { result, dragDistanceRef, unmount } = renderLayout({ cards });

    expect(result.current.carouselMaxHeight).toBe(360);
    expect(dragDistanceRef.current).toBe(216);
    expect(observerState.observe).toHaveBeenCalledTimes(2);
    expect(observerState.observe).toHaveBeenNthCalledWith(1, cards[0]);
    expect(mediaQuery.addListener).toHaveBeenCalledWith(changeHandler);

    act(() => observerState.callback());
    expect(result.current.carouselMaxHeight).toBe(360);

    unmount();
    expect(observerState.disconnect).toHaveBeenCalledTimes(1);
    expect(mediaQuery.removeListener).toHaveBeenCalledWith(changeHandler);
  });

  test('uses window resize when ResizeObserver is unavailable', () => {
    const mediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));
    vi.stubGlobal('ResizeObserver', undefined);
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const card = createCard({ height: 220, width: 250 });

    const { result, dragDistanceRef, unmount } = renderLayout({
      cards: [card],
    });

    expect(result.current.carouselMaxHeight).toBe(220);
    expect(dragDistanceRef.current).toBe(180);
    const resizeHandlers = addSpy.mock.calls.filter(
      ([eventName]) => eventName === 'resize'
    );
    expect(resizeHandlers).toHaveLength(1);

    act(() => window.dispatchEvent(new Event('resize')));
    expect(result.current.carouselMaxHeight).toBe(220);

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', resizeHandlers[0][1]);
  });

  test('ignores zero dimensions until cards have measurable geometry', () => {
    const mediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));
    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(function ResizeObserver() {
        this.observe = vi.fn();
        this.disconnect = vi.fn();
      })
    );

    const { result, dragDistanceRef } = renderLayout({
      cards: [createCard({ height: 0, width: 0 })],
      dragDistance: 99,
    });

    expect(result.current.carouselMaxHeight).toBeNull();
    expect(dragDistanceRef.current).toBe(99);
  });
});
