import { describe, expect, test } from 'vitest';

import {
  initialMethodologyInteractionState,
  methodologyInteractionReducer,
} from './methodologyInteraction';

const segments = {
  core: {
    id: 1,
    title: 'Core Effects',
  },
  neuro: {
    id: 2,
    title: 'Neuro-Biochemistry',
  },
  operational: {
    id: 3,
    title: 'Operational Sphere',
  },
};

const reduce = (state, type, segment) =>
  methodologyInteractionReducer(state, {
    type,
    segment,
  });

describe('methodologyInteractionReducer', () => {
  test('opens the first desktop segment immediately', () => {
    const state = reduce(
      initialMethodologyInteractionState,
      'segment-enter',
      segments.core
    );

    expect(state).toEqual({
      hoveredSegment: segments.core,
      activeContentId: segments.core.id,
      pendingSegment: null,
      isExiting: false,
    });
  });

  test('keeps an already active desktop segment open', () => {
    const initialState = {
      hoveredSegment: segments.core,
      activeContentId: segments.core.id,
      pendingSegment: null,
      isExiting: false,
    };

    const state = reduce(initialState, 'segment-enter', segments.core);

    expect(state.activeContentId).toBe(segments.core.id);
    expect(state.pendingSegment).toBeNull();
    expect(state.isExiting).toBe(false);
  });

  test('closes the active content before opening another segment', () => {
    const initialState = {
      hoveredSegment: segments.core,
      activeContentId: segments.core.id,
      pendingSegment: null,
      isExiting: false,
    };

    const state = reduce(initialState, 'segment-enter', segments.neuro);

    expect(state.hoveredSegment).toBe(segments.neuro);
    expect(state.activeContentId).toBeNull();
    expect(state.pendingSegment).toBe(segments.neuro);
    expect(state.isExiting).toBe(true);
  });

  test('keeps the content closed during a rapid A to B to C switch', () => {
    const coreState = {
      hoveredSegment: segments.core,
      activeContentId: segments.core.id,
      pendingSegment: null,
      isExiting: false,
    };

    const switchingToNeuro = reduce(coreState, 'segment-enter', segments.neuro);

    const switchingToOperational = reduce(
      switchingToNeuro,
      'segment-enter',
      segments.operational
    );

    expect(switchingToOperational.hoveredSegment).toBe(segments.operational);

    expect(switchingToOperational.activeContentId).toBeNull();

    expect(switchingToOperational.pendingSegment).toBe(segments.operational);

    expect(switchingToOperational.isExiting).toBe(true);
  });

  test('opens only the latest pending segment after the exit completes', () => {
    const exitingState = {
      hoveredSegment: segments.operational,
      activeContentId: null,
      pendingSegment: segments.operational,
      isExiting: true,
    };

    const state = methodologyInteractionReducer(exitingState, {
      type: 'exit-complete',
    });

    expect(state.activeContentId).toBe(segments.operational.id);

    expect(state.pendingSegment).toBeNull();
    expect(state.isExiting).toBe(false);
  });

  test('does not reopen content after the pointer leaves during an exit', () => {
    const exitingState = {
      hoveredSegment: segments.neuro,
      activeContentId: null,
      pendingSegment: segments.neuro,
      isExiting: true,
    };

    const leftState = methodologyInteractionReducer(exitingState, {
      type: 'interaction-leave',
    });

    const completedState = methodologyInteractionReducer(leftState, {
      type: 'exit-complete',
    });

    expect(completedState.hoveredSegment).toBeNull();
    expect(completedState.activeContentId).toBeNull();
    expect(completedState.pendingSegment).toBeNull();
    expect(completedState.isExiting).toBe(false);
  });

  test('opens and closes a mobile segment through toggle actions', () => {
    const openedState = reduce(
      initialMethodologyInteractionState,
      'segment-toggle',
      segments.core
    );

    expect(openedState.activeContentId).toBe(segments.core.id);

    const closingState = reduce(openedState, 'segment-toggle', segments.core);

    expect(closingState.hoveredSegment).toBeNull();
    expect(closingState.activeContentId).toBeNull();
    expect(closingState.pendingSegment).toBeNull();
    expect(closingState.isExiting).toBe(true);

    const closedState = methodologyInteractionReducer(closingState, {
      type: 'exit-complete',
    });

    expect(closedState.activeContentId).toBeNull();
    expect(closedState.isExiting).toBe(false);
  });

  test('allows the pending mobile selection to be replaced', () => {
    const exitingState = {
      hoveredSegment: segments.neuro,
      activeContentId: null,
      pendingSegment: segments.neuro,
      isExiting: true,
    };

    const state = reduce(exitingState, 'segment-toggle', segments.operational);

    expect(state.hoveredSegment).toBe(segments.operational);

    expect(state.activeContentId).toBeNull();

    expect(state.pendingSegment).toBe(segments.operational);

    expect(state.isExiting).toBe(true);
  });

  test('cancels a pending mobile selection when it is selected again', () => {
    const exitingState = {
      hoveredSegment: segments.neuro,
      activeContentId: null,
      pendingSegment: segments.neuro,
      isExiting: true,
    };

    const state = reduce(exitingState, 'segment-toggle', segments.neuro);

    expect(state.hoveredSegment).toBeNull();
    expect(state.activeContentId).toBeNull();
    expect(state.pendingSegment).toBeNull();
    expect(state.isExiting).toBe(true);
  });
});
