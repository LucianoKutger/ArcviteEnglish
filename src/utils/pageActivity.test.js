import { describe, expect, test, vi } from 'vitest';

import {
  isModalOpen,
  MODAL_VISIBILITY_EVENT,
  setModalOpen,
} from './pageActivity';

describe('pageActivity', () => {
  test('tracks modal state and announces both visibility changes', () => {
    const listener = vi.fn();
    document.addEventListener(MODAL_VISIBILITY_EVENT, listener);

    setModalOpen(true);
    expect(isModalOpen()).toBe(true);
    expect(listener.mock.calls[0][0].detail).toEqual({ open: true });

    setModalOpen(false);
    expect(isModalOpen()).toBe(false);
    expect(listener.mock.calls[1][0].detail).toEqual({ open: false });

    document.removeEventListener(MODAL_VISIBILITY_EVENT, listener);
  });

  test('is safe when no document is available', () => {
    vi.stubGlobal('document', undefined);

    expect(isModalOpen()).toBe(false);
    expect(() => setModalOpen(true)).not.toThrow();
  });
});
