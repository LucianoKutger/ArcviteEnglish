import { vi } from 'vitest';

const cleanupCallbacks = [];

const registerCleanup = (callback) => {
  cleanupCallbacks.push(callback);
};

const restoreProperty = (target, propertyName, originalDescriptor) => {
  if (originalDescriptor) {
    Object.defineProperty(target, propertyName, originalDescriptor);
    return;
  }

  delete target[propertyName];
};

export const resetBrowserMocks = () => {
  while (cleanupCallbacks.length > 0) {
    const cleanup = cleanupCallbacks.pop();
    cleanup();
  }
};

const evaluateMediaQuery = (query, width) => {
  const maxWidthMatch = query.match(/\(max-width:\s*(\d+(?:\.\d+)?)px\)/i);
  const minWidthMatch = query.match(/\(min-width:\s*(\d+(?:\.\d+)?)px\)/i);

  const matchesMaxWidth = maxWidthMatch
    ? width <= Number(maxWidthMatch[1])
    : true;

  const matchesMinWidth = minWidthMatch
    ? width >= Number(minWidthMatch[1])
    : true;

  return matchesMaxWidth && matchesMinWidth;
};

export const createMatchMediaController = (
  initialWidth,
  { useLegacyListeners = false } = {}
) => {
  let width = initialWidth;
  const mediaQueries = [];

  const originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'matchMedia'
  );

  const matchMediaMock = vi.fn((query) => {
    const modernListeners = new Set();
    const legacyListeners = new Set();

    const mediaQuery = {
      media: query,
      onchange: null,

      get matches() {
        return evaluateMediaQuery(query, width);
      },

      addEventListener: useLegacyListeners
        ? undefined
        : vi.fn((eventName, listener) => {
            if (eventName === 'change') {
              modernListeners.add(listener);
            }
          }),

      removeEventListener: useLegacyListeners
        ? undefined
        : vi.fn((eventName, listener) => {
            if (eventName === 'change') {
              modernListeners.delete(listener);
            }
          }),

      addListener: vi.fn((listener) => {
        legacyListeners.add(listener);
      }),

      removeListener: vi.fn((listener) => {
        legacyListeners.delete(listener);
      }),

      dispatchEvent: vi.fn((event) => {
        modernListeners.forEach((listener) => listener(event));
        legacyListeners.forEach((listener) => listener(event));

        if (typeof mediaQuery.onchange === 'function') {
          mediaQuery.onchange(event);
        }

        return true;
      }),

      notify() {
        const event = {
          matches: mediaQuery.matches,
          media: query,
        };

        mediaQuery.dispatchEvent(event);
      },
    };

    mediaQueries.push(mediaQuery);

    return mediaQuery;
  });

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: matchMediaMock,
  });

  registerCleanup(() => {
    restoreProperty(window, 'matchMedia', originalMatchMediaDescriptor);
  });

  return {
    mediaQueries,

    get width() {
      return width;
    },

    setWidth(nextWidth) {
      width = nextWidth;

      mediaQueries.forEach((mediaQuery) => {
        mediaQuery.notify();
      });
    },
  };
};

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

export const createDocumentVisibilityController = (
  initialVisibility = 'visible'
) => {
  let visibilityState = initialVisibility;

  const originalVisibilityDescriptor = Object.getOwnPropertyDescriptor(
    document,
    'visibilityState'
  );

  const originalHiddenDescriptor = Object.getOwnPropertyDescriptor(
    document,
    'hidden'
  );

  Object.defineProperty(document, 'visibilityState', {
    configurable: true,

    get() {
      return visibilityState;
    },
  });

  Object.defineProperty(document, 'hidden', {
    configurable: true,

    get() {
      return visibilityState === 'hidden';
    },
  });

  registerCleanup(() => {
    restoreProperty(document, 'visibilityState', originalVisibilityDescriptor);

    restoreProperty(document, 'hidden', originalHiddenDescriptor);
  });

  return {
    get visibilityState() {
      return visibilityState;
    },

    setVisibility(nextVisibility) {
      visibilityState = nextVisibility;
      document.dispatchEvent(new Event('visibilitychange'));
    },
  };
};

const getGlobalTargets = () => {
  const targets = [globalThis];

  if (typeof window !== 'undefined' && window !== globalThis) {
    targets.push(window);
  }

  return targets;
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

export const createAnimationFrameController = () => {
  let nextFrameId = 1;
  const callbacks = new Map();
  const targets = getGlobalTargets();

  const originalDescriptors = targets.map((target) => ({
    target,
    requestAnimationFrame: Object.getOwnPropertyDescriptor(
      target,
      'requestAnimationFrame'
    ),
    cancelAnimationFrame: Object.getOwnPropertyDescriptor(
      target,
      'cancelAnimationFrame'
    ),
  }));

  const requestAnimationFrameMock = vi.fn((callback) => {
    const frameId = nextFrameId;
    nextFrameId += 1;

    callbacks.set(frameId, callback);

    return frameId;
  });

  const cancelAnimationFrameMock = vi.fn((frameId) => {
    callbacks.delete(frameId);
  });

  targets.forEach((target) => {
    Object.defineProperty(target, 'requestAnimationFrame', {
      configurable: true,
      writable: true,
      value: requestAnimationFrameMock,
    });

    Object.defineProperty(target, 'cancelAnimationFrame', {
      configurable: true,
      writable: true,
      value: cancelAnimationFrameMock,
    });
  });

  registerCleanup(() => {
    callbacks.clear();

    originalDescriptors.forEach(
      ({
        target,
        requestAnimationFrame: requestDescriptor,
        cancelAnimationFrame: cancelDescriptor,
      }) => {
        restoreProperty(target, 'requestAnimationFrame', requestDescriptor);

        restoreProperty(target, 'cancelAnimationFrame', cancelDescriptor);
      }
    );
  });

  return {
    requestAnimationFrameMock,
    cancelAnimationFrameMock,

    get pendingFrameCount() {
      return callbacks.size;
    },

    get pendingFrameIds() {
      return Array.from(callbacks.keys());
    },

    runNextFrame(timestamp = 16) {
      const nextFrame = callbacks.entries().next();

      if (nextFrame.done) {
        return false;
      }

      const [frameId, callback] = nextFrame.value;

      callbacks.delete(frameId);
      callback(timestamp);

      return true;
    },

    runFrames(count, startingTimestamp = 16) {
      let executedFrames = 0;

      for (let index = 0; index < count; index += 1) {
        const executed = this.runNextFrame(startingTimestamp + index * 16);

        if (!executed) {
          break;
        }

        executedFrames += 1;
      }

      return executedFrames;
    },
  };
};

const createCanvasContext = (overrides = {}) => {
  const gradients = [];

  const createGradient = vi.fn(() => {
    const gradient = {
      addColorStop: vi.fn(),
    };

    gradients.push(gradient);

    return gradient;
  });

  const context = {
    canvas: null,

    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    arc: vi.fn(),

    fill: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),

    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),

    createLinearGradient: createGradient,
    createRadialGradient: createGradient,

    measureText: vi.fn((text) => ({
      width: String(text).length * 8,
    })),

    drawImage: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),

    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    shadowBlur: 0,
    shadowColor: '',

    gradients,

    ...overrides,
  };

  return context;
};

export const createCanvasMock = ({ contextOverrides = {} } = {}) => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    HTMLCanvasElement.prototype,
    'getContext'
  );

  const contextsByCanvas = new WeakMap();
  const contexts = [];

  const getContextMock = vi.fn(function getContext(type) {
    if (type !== '2d') {
      return null;
    }

    if (!contextsByCanvas.has(this)) {
      const context = createCanvasContext(contextOverrides);

      context.canvas = this;
      contextsByCanvas.set(this, context);
      contexts.push(context);
    }

    return contextsByCanvas.get(this);
  });

  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    writable: true,
    value: getContextMock,
  });

  registerCleanup(() => {
    restoreProperty(
      HTMLCanvasElement.prototype,
      'getContext',
      originalDescriptor
    );
  });

  return {
    contexts,
    getContextMock,

    get latestContext() {
      return contexts.at(-1);
    },
  };
};

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
