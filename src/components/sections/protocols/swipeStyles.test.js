import { describe, expect, test, vi } from 'vitest';

import { resetSwipeStyles, updateSwipeStyles } from './swipeStyles';

const createGrid = () => {
  const grid = document.createElement('div');
  vi.spyOn(grid.style, 'setProperty');
  return grid;
};

const project = (overrides = {}) => {
  const grid = overrides.grid === undefined ? createGrid() : overrides.grid;
  const getWrappedIndex = vi.fn((index) => (index + 6) % 6);
  const result = updateSwipeStyles({
    activeIndex: 2,
    dragDirection: 'idle',
    dragDistance: 100,
    getWrappedIndex,
    grid,
    latestX: 0,
    ...overrides,
  });

  return { getWrappedIndex, grid, result };
};

describe('swipeStyles', () => {
  test('does nothing before the carousel grid is mounted', () => {
    expect(project({ grid: null }).result).toBeNull();
    expect(() => resetSwipeStyles(null)).not.toThrow();
  });

  test('projects an incoming next card and clamps progress at one', () => {
    const { getWrappedIndex, grid, result } = project({ latestX: -150 });

    expect(result).toBe(3);
    expect(getWrappedIndex).toHaveBeenCalledWith(3);
    expect(grid.dataset.swipeDirection).toBe('next');
    expect(grid.dataset.swipeFront).toBe('incoming');
    expect(grid.style.getPropertyValue('--swipe-progress')).toBe('1');
    expect(grid.style.getPropertyValue('--active-scale')).toBe('0.76');
    expect(grid.style.getPropertyValue('--incoming-scale')).toBe('1');
    expect(grid.style.getPropertyValue('--outgoing-opacity')).toBe('0');
  });

  test('projects the previous card after crossing the front threshold', () => {
    const { getWrappedIndex, grid, result } = project({ latestX: 60 });

    expect(result).toBe(1);
    expect(getWrappedIndex).toHaveBeenCalledWith(1);
    expect(grid.dataset.swipeDirection).toBe('previous');
    expect(grid.dataset.swipeFront).toBe('incoming');
  });

  test('keeps the active indicator below the threshold and reuses drag direction at zero', () => {
    const { getWrappedIndex, grid, result } = project({
      dragDirection: 'next',
      latestX: 0,
    });

    expect(result).toBe(2);
    expect(getWrappedIndex).not.toHaveBeenCalled();
    expect(grid.dataset.swipeDirection).toBe('next');
    expect(grid.dataset.swipeFront).toBe('active');
  });

  test('restores the neutral swipe presentation', () => {
    const grid = createGrid();
    grid.dataset.swipeDirection = 'previous';
    grid.dataset.swipeFront = 'incoming';

    resetSwipeStyles(grid);

    expect(grid.dataset.swipeDirection).toBe('idle');
    expect(grid.dataset.swipeFront).toBe('active');
    expect(grid.style.getPropertyValue('--swipe-progress')).toBe('0');
  });
});
