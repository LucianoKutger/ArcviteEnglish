import { expect, test, vi } from 'vitest';

import useProtocolCarouselLayout from './useProtocolCarouselLayout';

vi.mock('react', () => ({
  useEffect: vi.fn(),
  useLayoutEffect: vi.fn(),
  useState: (initialValue) => [
    typeof initialValue === 'function' ? initialValue() : initialValue,
    vi.fn(),
  ],
}));

test('defaults to desktop layout during server rendering', () => {
  vi.stubGlobal('window', undefined);

  const layout = useProtocolCarouselLayout(
    { current: [] },
    { current: 1 }
  );

  expect(layout).toEqual({
    carouselMaxHeight: null,
    isDesktop: true,
  });
});
