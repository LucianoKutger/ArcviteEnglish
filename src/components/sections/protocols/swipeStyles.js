import { SWIPE_FRONT_PROGRESS } from './carouselConfig';

export const updateSwipeStyles = ({
  activeIndex,
  dragDirection,
  dragDistance,
  getWrappedIndex,
  grid,
  latestX,
}) => {
  if (!grid) {
    return null;
  }

  const progress = Math.min(Math.abs(latestX) / dragDistance, 1);
  const direction =
    latestX < 0
      ? 'next'
      : latestX > 0
        ? 'previous'
        : dragDirection;
  const nextVisualIndicatorIndex =
    progress >= SWIPE_FRONT_PROGRESS && direction !== 'idle'
      ? getWrappedIndex(activeIndex + (direction === 'next' ? 1 : -1))
      : activeIndex;

  grid.dataset.swipeDirection = direction;
  grid.dataset.swipeFront =
    progress >= SWIPE_FRONT_PROGRESS ? 'incoming' : 'active';
  grid.style.setProperty('--swipe-progress', progress.toString());
  grid.style.setProperty('--active-scale', (1 - progress * 0.24).toString());
  grid.style.setProperty(
    '--incoming-scale',
    (0.76 + progress * 0.24).toString()
  );
  grid.style.setProperty(
    '--outgoing-scale',
    (0.76 - progress * 0.08).toString()
  );
  grid.style.setProperty('--far-scale', (0.68 + progress * 0.08).toString());
  grid.style.setProperty(
    '--active-opacity',
    (1 - progress * 0.32).toString()
  );
  grid.style.setProperty(
    '--incoming-opacity',
    (0.68 + progress * 0.32).toString()
  );
  grid.style.setProperty(
    '--outgoing-opacity',
    (0.68 * (1 - progress)).toString()
  );
  grid.style.setProperty('--far-opacity', (0.68 * progress).toString());
  grid.style.setProperty(
    '--active-brightness',
    (1 - progress * 0.62).toString()
  );
  grid.style.setProperty(
    '--incoming-brightness',
    (0.38 + progress * 0.62).toString()
  );
  grid.style.setProperty(
    '--far-brightness',
    (0.3 + progress * 0.08).toString()
  );

  return nextVisualIndicatorIndex;
};

export const resetSwipeStyles = (grid) => {
  if (!grid) {
    return;
  }

  grid.dataset.swipeDirection = 'idle';
  grid.dataset.swipeFront = 'active';
  grid.style.setProperty('--swipe-progress', '0');
};
