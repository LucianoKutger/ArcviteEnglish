import { expect, test, vi } from 'vitest';

import useViewportActivity from './useViewportActivity';

vi.mock('react', () => ({
  useEffect: (effect) => effect(),
  useRef: (current) => ({ current }),
  useState: (initialValue) => [
    typeof initialValue === 'function' ? initialValue() : initialValue,
    vi.fn(),
  ],
}));

test('stays active during server rendering without browser globals', () => {
  vi.stubGlobal('window', undefined);
  vi.stubGlobal('document', undefined);

  const activity = useViewportActivity();

  expect(activity.targetRef.current).toBeNull();
  expect(activity.isActive).toBe(true);
});
