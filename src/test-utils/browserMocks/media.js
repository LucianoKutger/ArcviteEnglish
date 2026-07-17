import { vi } from 'vitest';

import { registerCleanup, restoreProperty } from './cleanup';

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
