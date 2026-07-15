import React, { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import {
  createDocumentVisibilityController,
  createIntersectionObserverController,
} from '../test-utils/browserMocks';

import useViewportActivity from './useViewportActivity';

function ActivityProbe({ rootMargin } = {}) {
  const options = rootMargin ? { rootMargin } : undefined;
  const { targetRef, isActive } = useViewportActivity(options);

  return (
    <div ref={targetRef} data-testid="activity-probe">
      {isActive ? 'active' : 'paused'}
    </div>
  );
}

describe('useViewportActivity', () => {
  let intersectionController;
  let visibilityController;

  beforeEach(() => {
    intersectionController = createIntersectionObserverController();
    visibilityController = createDocumentVisibilityController('visible');
  });

  test('combines viewport proximity with document visibility', () => {
    const { unmount } = render(
      <StrictMode>
        <ActivityProbe />
      </StrictMode>
    );

    const observer = intersectionController.latestObserver;

    expect(observer.options).toEqual({
      rootMargin: '250px 0px',
      threshold: 0,
    });

    expect(screen.getByTestId('activity-probe')).toHaveTextContent('active');

    act(() => {
      observer.setIsIntersecting(false);
    });

    expect(screen.getByTestId('activity-probe')).toHaveTextContent('paused');

    act(() => {
      observer.setIsIntersecting(true);
    });

    expect(screen.getByTestId('activity-probe')).toHaveTextContent('active');

    act(() => {
      visibilityController.setVisibility('hidden');
    });

    expect(screen.getByTestId('activity-probe')).toHaveTextContent('paused');

    act(() => {
      visibilityController.setVisibility('visible');
    });

    expect(screen.getByTestId('activity-probe')).toHaveTextContent('active');

    unmount();

    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  test('keeps animations active when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    render(<ActivityProbe />);

    expect(screen.getByTestId('activity-probe')).toHaveTextContent('active');
  });

  test('passes a custom root margin to IntersectionObserver', () => {
    render(<ActivityProbe rootMargin="50px 25px" />);

    const observer = intersectionController.latestObserver;
    const probe = screen.getByTestId('activity-probe');

    expect(observer.options).toEqual({
      rootMargin: '50px 25px',
      threshold: 0,
    });

    expect(observer.observe).toHaveBeenCalledWith(probe);
  });

  test('starts paused when the document is initially hidden', () => {
    visibilityController.setVisibility('hidden');

    render(<ActivityProbe />);

    expect(screen.getByTestId('activity-probe')).toHaveTextContent('paused');

    act(() => {
      visibilityController.setVisibility('visible');
    });

    expect(screen.getByTestId('activity-probe')).toHaveTextContent('active');
  });

  test('stays active when IntersectionObserver provides no entry', () => {
    render(<ActivityProbe />);

    const observer = intersectionController.latestObserver;

    act(() => {
      observer.callback([], observer);
    });

    expect(screen.getByTestId('activity-probe')).toHaveTextContent('active');
  });
});
