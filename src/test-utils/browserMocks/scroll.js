import { vi } from 'vitest';

import { registerCleanup, restoreProperty } from './cleanup';

export const createScrollController = ({ x = 0, y = 0 } = {}) => {
  let currentX = x;
  let currentY = y;

  const windowPropertyNames = [
    'scrollX',
    'scrollY',
    'pageXOffset',
    'pageYOffset',
    'scroll',
    'scrollTo',
    'scrollBy',
  ];

  const originalWindowDescriptors = windowPropertyNames.map((propertyName) => ({
    propertyName,
    descriptor: Object.getOwnPropertyDescriptor(window, propertyName),
  }));

  const originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'scrollIntoView'
  );

  const updatePosition = (nextX, nextY) => {
    currentX = Number(nextX) || 0;
    currentY = Number(nextY) || 0;
  };

  const scrollToMock = vi.fn((firstArgument, secondArgument) => {
    if (typeof firstArgument === 'object' && firstArgument !== null) {
      updatePosition(
        firstArgument.left ?? currentX,
        firstArgument.top ?? currentY
      );

      return;
    }

    updatePosition(firstArgument, secondArgument);
  });

  const scrollByMock = vi.fn((firstArgument, secondArgument) => {
    if (typeof firstArgument === 'object' && firstArgument !== null) {
      updatePosition(
        currentX + (firstArgument.left ?? 0),
        currentY + (firstArgument.top ?? 0)
      );

      return;
    }

    updatePosition(
      currentX + (Number(firstArgument) || 0),
      currentY + (Number(secondArgument) || 0)
    );
  });

  const scrollIntoViewMock = vi.fn();

  ['scrollX', 'pageXOffset'].forEach((propertyName) => {
    Object.defineProperty(window, propertyName, {
      configurable: true,

      get() {
        return currentX;
      },
    });
  });

  ['scrollY', 'pageYOffset'].forEach((propertyName) => {
    Object.defineProperty(window, propertyName, {
      configurable: true,

      get() {
        return currentY;
      },
    });
  });

  Object.defineProperty(window, 'scroll', {
    configurable: true,
    writable: true,
    value: scrollToMock,
  });

  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    writable: true,
    value: scrollToMock,
  });

  Object.defineProperty(window, 'scrollBy', {
    configurable: true,
    writable: true,
    value: scrollByMock,
  });

  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    writable: true,
    value: scrollIntoViewMock,
  });

  registerCleanup(() => {
    originalWindowDescriptors.forEach(({ propertyName, descriptor }) => {
      restoreProperty(window, propertyName, descriptor);
    });

    restoreProperty(
      HTMLElement.prototype,
      'scrollIntoView',
      originalScrollIntoViewDescriptor
    );
  });

  return {
    scrollToMock,
    scrollByMock,
    scrollIntoViewMock,

    get x() {
      return currentX;
    },

    get y() {
      return currentY;
    },

    setPosition({
      x: nextX = currentX,
      y: nextY = currentY,
      dispatchEvent = true,
    } = {}) {
      updatePosition(nextX, nextY);

      if (dispatchEvent) {
        window.dispatchEvent(new Event('scroll'));
      }
    },
  };
};
