import { vi } from 'vitest';

import { registerCleanup, restoreProperty } from './cleanup';
import { getGlobalTargets } from './globals';

export const createIntersectionObserverController = () => {
  const observers = [];

  const originalDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'IntersectionObserver'
  );

  class MockIntersectionObserver {
    constructor(callback, options = {}) {
      this.callback = callback;
      this.options = options;
      this.targets = new Set();

      this.observe = vi.fn((target) => {
        this.targets.add(target);
      });

      this.unobserve = vi.fn((target) => {
        this.targets.delete(target);
      });

      this.disconnect = vi.fn(() => {
        this.targets.clear();
      });

      this.takeRecords = vi.fn(() => []);

      observers.push(this);
    }

    setIsIntersecting(isIntersecting, target) {
      const observedTarget = target ?? Array.from(this.targets)[0];

      this.callback(
        [
          {
            target: observedTarget,
            isIntersecting,
            intersectionRatio: isIntersecting ? 1 : 0,
          },
        ],
        this
      );
    }
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: MockIntersectionObserver,
  });

  registerCleanup(() => {
    restoreProperty(window, 'IntersectionObserver', originalDescriptor);
  });

  return {
    observers,

    get latestObserver() {
      return observers.at(-1);
    },
  };
};

export const createResizeObserverController = () => {
  const observers = [];
  const targets = getGlobalTargets();

  const originalDescriptors = targets.map((target) => ({
    target,
    descriptor: Object.getOwnPropertyDescriptor(target, 'ResizeObserver'),
  }));

  class MockResizeObserver {
    constructor(callback) {
      this.callback = callback;
      this.targets = new Set();

      this.observe = vi.fn((target) => {
        this.targets.add(target);
      });

      this.unobserve = vi.fn((target) => {
        this.targets.delete(target);
      });

      this.disconnect = vi.fn(() => {
        this.targets.clear();
      });

      observers.push(this);
    }
  }

  targets.forEach((target) => {
    Object.defineProperty(target, 'ResizeObserver', {
      configurable: true,
      writable: true,
      value: MockResizeObserver,
    });
  });

  registerCleanup(() => {
    originalDescriptors.forEach(({ target, descriptor }) => {
      restoreProperty(target, 'ResizeObserver', descriptor);
    });
  });

  const createEntry = (
    target,
    { width = 0, height = 0, top = 0, left = 0 } = {}
  ) => ({
    target,
    contentRect: {
      width,
      height,
      top,
      left,
      x: left,
      y: top,
      right: left + width,
      bottom: top + height,
    },
  });

  return {
    observers,

    get latestObserver() {
      return observers.at(-1);
    },

    trigger(target, dimensions = {}) {
      const entry = createEntry(target, dimensions);

      observers
        .filter((observer) => observer.targets.has(target))
        .forEach((observer) => {
          observer.callback([entry], observer);
        });
    },
  };
};
