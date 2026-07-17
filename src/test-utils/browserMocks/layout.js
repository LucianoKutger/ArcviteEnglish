import { vi } from 'vitest';

import { registerCleanup, restoreProperty } from './cleanup';

export const createDevicePixelRatioController = (
  initialDevicePixelRatio = 1
) => {
  let devicePixelRatio = initialDevicePixelRatio;

  const originalDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'devicePixelRatio'
  );

  Object.defineProperty(window, 'devicePixelRatio', {
    configurable: true,

    get() {
      return devicePixelRatio;
    },
  });

  registerCleanup(() => {
    restoreProperty(window, 'devicePixelRatio', originalDescriptor);
  });

  return {
    get value() {
      return devicePixelRatio;
    },

    setValue(nextDevicePixelRatio) {
      devicePixelRatio = nextDevicePixelRatio;
    },
  };
};

export const createElementSizeController = (
  element,
  { width = 0, height = 0, top = 0, left = 0 } = {}
) => {
  let currentWidth = width;
  let currentHeight = height;
  let currentTop = top;
  let currentLeft = left;

  const propertyNames = [
    'offsetWidth',
    'offsetHeight',
    'clientWidth',
    'clientHeight',
    'scrollWidth',
    'scrollHeight',
    'getBoundingClientRect',
  ];

  const originalDescriptors = propertyNames.map((propertyName) => ({
    propertyName,
    descriptor: Object.getOwnPropertyDescriptor(element, propertyName),
  }));

  const createRect = () => ({
    width: currentWidth,
    height: currentHeight,
    top: currentTop,
    left: currentLeft,
    x: currentLeft,
    y: currentTop,
    right: currentLeft + currentWidth,
    bottom: currentTop + currentHeight,

    toJSON() {
      return {
        width: currentWidth,
        height: currentHeight,
        top: currentTop,
        left: currentLeft,
        x: currentLeft,
        y: currentTop,
        right: currentLeft + currentWidth,
        bottom: currentTop + currentHeight,
      };
    },
  });

  const dimensionGetters = {
    offsetWidth: () => currentWidth,
    offsetHeight: () => currentHeight,
    clientWidth: () => currentWidth,
    clientHeight: () => currentHeight,
    scrollWidth: () => currentWidth,
    scrollHeight: () => currentHeight,
  };

  Object.entries(dimensionGetters).forEach(([propertyName, getter]) => {
    Object.defineProperty(element, propertyName, {
      configurable: true,
      get: getter,
    });
  });

  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    writable: true,
    value: vi.fn(createRect),
  });

  registerCleanup(() => {
    originalDescriptors.forEach(({ propertyName, descriptor }) => {
      restoreProperty(element, propertyName, descriptor);
    });
  });

  return {
    setSize({
      width: nextWidth = currentWidth,
      height: nextHeight = currentHeight,
      top: nextTop = currentTop,
      left: nextLeft = currentLeft,
    } = {}) {
      currentWidth = nextWidth;
      currentHeight = nextHeight;
      currentTop = nextTop;
      currentLeft = nextLeft;
    },

    get rect() {
      return createRect();
    },
  };
};

export const createWindowSizeController = ({
  width = 1024,
  height = 768,
} = {}) => {
  let currentWidth = width;
  let currentHeight = height;

  const originalWidthDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'innerWidth'
  );

  const originalHeightDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'innerHeight'
  );

  Object.defineProperty(window, 'innerWidth', {
    configurable: true,

    get() {
      return currentWidth;
    },
  });

  Object.defineProperty(window, 'innerHeight', {
    configurable: true,

    get() {
      return currentHeight;
    },
  });

  registerCleanup(() => {
    restoreProperty(window, 'innerWidth', originalWidthDescriptor);

    restoreProperty(window, 'innerHeight', originalHeightDescriptor);
  });

  return {
    setSize({
      width: nextWidth = currentWidth,
      height: nextHeight = currentHeight,
      dispatchEvent = true,
    } = {}) {
      currentWidth = nextWidth;
      currentHeight = nextHeight;

      if (dispatchEvent) {
        window.dispatchEvent(new Event('resize'));
      }
    },
  };
};
