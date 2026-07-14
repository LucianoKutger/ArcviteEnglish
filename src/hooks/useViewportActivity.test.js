import React, { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import useViewportActivity from './useViewportActivity';

let observers;

class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observe = jest.fn();
    this.disconnect = jest.fn();
    observers.push(this);
  }

  setIsIntersecting(isIntersecting) {
    this.callback([{ isIntersecting }]);
  }
}

function ActivityProbe() {
  const { targetRef, isActive } = useViewportActivity();

  return (
    <div ref={targetRef} data-testid="activity-probe">
      {isActive ? 'active' : 'paused'}
    </div>
  );
}

const setDocumentVisibility = (visibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: visibilityState,
  });
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('useViewportActivity', () => {
  const originalIntersectionObserver = window.IntersectionObserver;
  const originalVisibilityDescriptor = Object.getOwnPropertyDescriptor(
    document,
    'visibilityState',
  );

  beforeEach(() => {
    observers = [];
    window.IntersectionObserver = MockIntersectionObserver;
    setDocumentVisibility('visible');
  });

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver;

    if (originalVisibilityDescriptor) {
      Object.defineProperty(
        document,
        'visibilityState',
        originalVisibilityDescriptor,
      );
    } else {
      delete document.visibilityState;
    }
  });

  test('combines viewport proximity with document visibility', () => {
    const { unmount } = render(
      <StrictMode>
        <ActivityProbe />
      </StrictMode>,
    );
    const observer = observers[observers.length - 1];

    expect(observer.options).toEqual({
      rootMargin: '250px 0px',
      threshold: 0,
    });
    expect(screen.getByTestId('activity-probe')).toHaveTextContent('active');

    act(() => observer.setIsIntersecting(false));
    expect(screen.getByTestId('activity-probe')).toHaveTextContent('paused');

    act(() => observer.setIsIntersecting(true));
    expect(screen.getByTestId('activity-probe')).toHaveTextContent('active');

    act(() => setDocumentVisibility('hidden'));
    expect(screen.getByTestId('activity-probe')).toHaveTextContent('paused');

    act(() => setDocumentVisibility('visible'));
    expect(screen.getByTestId('activity-probe')).toHaveTextContent('active');

    unmount();
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  test('keeps animations active when IntersectionObserver is unavailable', () => {
    window.IntersectionObserver = undefined;

    render(<ActivityProbe />);

    expect(screen.getByTestId('activity-probe')).toHaveTextContent('active');
  });
});
