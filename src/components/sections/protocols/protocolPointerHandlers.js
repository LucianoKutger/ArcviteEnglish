import {
  SWIPE_COMMIT_PROGRESS,
  SWIPE_DIRECTION_LOCK_PX,
  SWIPE_DRAG_LIMIT,
  SWIPE_FLICK_PROGRESS,
  SWIPE_FLICK_VELOCITY,
  SWIPE_VERTICAL_BIAS,
} from './carouselConfig';

const getSwipeRelease = (dragX, dragDistance) => {
  const currentX = dragX.get();
  const progress = Math.min(Math.abs(currentX) / dragDistance, 1);
  const velocity = dragX.getVelocity();

  return {
    direction: currentX < 0 ? 'next' : 'previous',
    shouldCommit:
      progress >= SWIPE_COMMIT_PROGRESS ||
      (progress >= SWIPE_FLICK_PROGRESS &&
        Math.abs(velocity) >= SWIPE_FLICK_VELOCITY),
    velocity,
  };
};

export const createProtocolPointerHandlers = ({
  dragDirectionRef,
  dragDistanceRef,
  dragX,
  finishSettlingSwipe,
  isDesktop,
  pointerStartRef,
  releaseSuppressedClick,
  settleSwipe,
  suppressClickRef,
  suppressClickTimeoutRef,
}) => {
  const handlePointerDown = (event) => {
    if (isDesktop || event.button > 0) {
      return;
    }

    finishSettlingSwipe();

    if (suppressClickTimeoutRef.current !== null) {
      window.clearTimeout(suppressClickTimeoutRef.current);
      suppressClickTimeoutRef.current = null;
    }

    suppressClickRef.current = false;

    pointerStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      axis: null,
    };
  };

  const handlePointerMove = (event) => {
    const pointerStart = pointerStartRef.current;

    if (
      isDesktop ||
      pointerStart === null ||
      pointerStart.pointerId !== event.pointerId
    ) {
      return;
    }

    const swipeDistance = event.clientX - pointerStart.x;
    const verticalDistance = event.clientY - pointerStart.y;

    if (pointerStart.axis === null) {
      if (
        Math.max(Math.abs(swipeDistance), Math.abs(verticalDistance)) <
        SWIPE_DIRECTION_LOCK_PX
      ) {
        return;
      }

      if (
        Math.abs(verticalDistance) >
        Math.abs(swipeDistance) * SWIPE_VERTICAL_BIAS
      ) {
        pointerStartRef.current = null;
        return;
      }

      pointerStart.axis = 'horizontal';
      suppressClickRef.current = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    event.preventDefault();

    const maxDistance = dragDistanceRef.current * SWIPE_DRAG_LIMIT;
    const constrainedDistance = Math.max(
      -maxDistance,
      Math.min(maxDistance, swipeDistance)
    );

    dragDirectionRef.current = constrainedDistance < 0 ? 'next' : 'previous';
    dragX.set(constrainedDistance);
  };

  const settlePointerGesture = () => {
    const { direction, shouldCommit, velocity } = getSwipeRelease(
      dragX,
      dragDistanceRef.current
    );

    settleSwipe(direction, shouldCommit, velocity);
    releaseSuppressedClick();
  };

  const handlePointerUp = (event) => {
    const pointerStart = pointerStartRef.current;

    if (
      isDesktop ||
      pointerStart === null ||
      pointerStart.pointerId !== event.pointerId
    ) {
      return;
    }

    pointerStartRef.current = null;

    if (pointerStart.axis !== 'horizontal') {
      return;
    }

    settlePointerGesture();
  };

  const handlePointerCancel = () => {
    const pointerStart = pointerStartRef.current;

    if (pointerStart === null) {
      return;
    }

    pointerStartRef.current = null;

    if (pointerStart.axis !== 'horizontal') {
      return;
    }

    settlePointerGesture();
  };

  const handleCarouselClickCapture = (event) => {
    if (!suppressClickRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;

    if (suppressClickTimeoutRef.current !== null) {
      window.clearTimeout(suppressClickTimeoutRef.current);
      suppressClickTimeoutRef.current = null;
    }
  };

  return {
    handleCarouselClickCapture,
    handlePointerCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
};
