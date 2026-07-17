import { vi } from 'vitest';

import { registerCleanup, restoreProperty } from './cleanup';

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
