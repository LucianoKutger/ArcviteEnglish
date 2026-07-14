import React from 'react';
import { act, render, screen } from '@testing-library/react';
import useLocalSectionGlowVisibility, {
  getMediaQueryMatch,
  LOCAL_SECTION_GLOW_MEDIA_QUERY,
} from './useLocalSectionGlowVisibility';

const hiddenGlowWidths = [
  390,
  768,
  1024,
  1180,
  1280,
  1366,
  1376,
  1439,
  1440,
];
const visibleGlowWidths = [1441, 1536, 1920];

const createMatchMediaController = (initialWidth) => {
  let width = initialWidth;
  const listeners = new Set();
  const mediaQueries = [];

  window.matchMedia = jest.fn((query) => {
    const mediaQuery = {
      media: query,
      get matches() {
        return width <= 1440;
      },
      addEventListener: jest.fn((_eventName, listener) => {
        listeners.add(listener);
      }),
      removeEventListener: jest.fn((_eventName, listener) => {
        listeners.delete(listener);
      }),
    };

    mediaQueries.push(mediaQuery);
    return mediaQuery;
  });

  return {
    mediaQueries,
    setWidth(nextWidth) {
      width = nextWidth;
      listeners.forEach((listener) =>
        listener({ matches: width <= 1440 }),
      );
    },
  };
};

function VisibilityProbe() {
  const shouldRender = useLocalSectionGlowVisibility();

  return <div data-testid="glow-visibility">{shouldRender ? 'render' : 'omit'}</div>;
}

describe('useLocalSectionGlowVisibility', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  test.each(hiddenGlowWidths)('omits local glows at %ipx', (width) => {
    createMatchMediaController(width);

    render(<VisibilityProbe />);

    expect(screen.getByTestId('glow-visibility')).toHaveTextContent('omit');
    expect(window.matchMedia).toHaveBeenCalledWith(
      LOCAL_SECTION_GLOW_MEDIA_QUERY,
    );
  });

  test.each(visibleGlowWidths)('renders local glows at %ipx', (width) => {
    createMatchMediaController(width);

    render(<VisibilityProbe />);

    expect(screen.getByTestId('glow-visibility')).toHaveTextContent('render');
  });

  test('unmounts and remounts glows when the query boundary changes', () => {
    const controller = createMatchMediaController(1536);
    render(<VisibilityProbe />);

    expect(screen.getByTestId('glow-visibility')).toHaveTextContent('render');

    act(() => controller.setWidth(1440));
    expect(screen.getByTestId('glow-visibility')).toHaveTextContent('omit');

    act(() => controller.setWidth(1441));
    expect(screen.getByTestId('glow-visibility')).toHaveTextContent('render');
  });

  test('removes the media query listener on unmount', () => {
    const controller = createMatchMediaController(1536);
    const { unmount } = render(<VisibilityProbe />);
    const subscribedQuery = controller.mediaQueries.at(-1);
    const subscribedListener = subscribedQuery.addEventListener.mock.calls[0][1];

    unmount();

    expect(subscribedQuery.removeEventListener).toHaveBeenCalledWith(
      'change',
      subscribedListener,
    );
  });

  test('keeps glows visible when matchMedia is unavailable', () => {
    window.matchMedia = undefined;

    render(<VisibilityProbe />);

    expect(screen.getByTestId('glow-visibility')).toHaveTextContent('render');
  });

  test('can evaluate safely without a window object', () => {
    expect(getMediaQueryMatch(undefined)).toBe(false);
  });
});
