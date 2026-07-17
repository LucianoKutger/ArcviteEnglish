import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { animate, useMotionValue } from 'framer-motion';

import { solutions } from '../../../data/content';
import {
  SWIPE_MAX_RELEASE_VELOCITY,
  SWIPE_SPRING,
} from './carouselConfig';
import { createProtocolPointerHandlers } from './protocolPointerHandlers';
import {
  resetSwipeStyles as resetSwipePresentation,
  updateSwipeStyles,
} from './swipeStyles';
import useProtocolCarouselLayout from './useProtocolCarouselLayout';

const getWrappedIndex = (index) =>
  (index + solutions.length) % solutions.length;

const useProtocolCarousel = ({ onSelectSolution }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visualIndicatorIndex, setVisualIndicatorIndex] = useState(0);
  const gridRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const pointerStartRef = useRef(null);
  const dragDistanceRef = useRef(1);
  const dragDirectionRef = useRef('idle');
  const activeIndexRef = useRef(0);
  const visualIndicatorIndexRef = useRef(0);
  const swipeAnimationRef = useRef(null);
  const commitFrameRef = useRef(null);
  const swipeSequenceRef = useRef(0);
  const isSettlingRef = useRef(false);
  const settlingSwipeRef = useRef(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimeoutRef = useRef(null);
  const dragX = useMotionValue(0);
  const { carouselMaxHeight, isDesktop } = useProtocolCarouselLayout(
    cardRefs,
    dragDistanceRef
  );

  useEffect(
    () => () => {
      swipeAnimationRef.current?.stop();
      settlingSwipeRef.current = null;

      if (commitFrameRef.current !== null) {
        window.cancelAnimationFrame(commitFrameRef.current);
      }

      if (suppressClickTimeoutRef.current !== null) {
        window.clearTimeout(suppressClickTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const projectSwipeStyles = (latestX) => {
      const nextVisualIndicatorIndex = updateSwipeStyles({
        activeIndex: activeIndexRef.current,
        dragDirection: dragDirectionRef.current,
        dragDistance: dragDistanceRef.current,
        getWrappedIndex,
        grid: gridRef.current,
        latestX,
      });

      if (
        nextVisualIndicatorIndex !== null &&
        nextVisualIndicatorIndex !== visualIndicatorIndexRef.current
      ) {
        visualIndicatorIndexRef.current = nextVisualIndicatorIndex;
        setVisualIndicatorIndex(nextVisualIndicatorIndex);
      }
    };

    const unsubscribe = dragX.on('change', projectSwipeStyles);

    return unsubscribe;
  }, [dragX]);

  const resetSwipeStyles = () => {
    dragDirectionRef.current = 'idle';
    resetSwipePresentation(gridRef.current);
  };

  const releaseSuppressedClick = () => {
    suppressClickTimeoutRef.current = window.setTimeout(() => {
      suppressClickRef.current = false;
      suppressClickTimeoutRef.current = null;
    }, 0);
  };

  const selectActiveIndex = (nextIndex) => {
    const wrappedIndex = getWrappedIndex(nextIndex);

    if (commitFrameRef.current !== null) {
      window.cancelAnimationFrame(commitFrameRef.current);
      commitFrameRef.current = null;
    }

    gridRef.current?.removeAttribute('data-swipe-committing');
    swipeSequenceRef.current += 1;
    swipeAnimationRef.current?.stop();
    swipeAnimationRef.current = null;
    isSettlingRef.current = false;
    settlingSwipeRef.current = null;
    pointerStartRef.current = null;
    dragX.set(0);
    resetSwipeStyles();
    activeIndexRef.current = wrappedIndex;
    visualIndicatorIndexRef.current = wrappedIndex;
    setActiveIndex(wrappedIndex);
    setVisualIndicatorIndex(wrappedIndex);
  };

  const applySettledSwipe = (direction, shouldCommit, selectedItem = null) => {
    if (!shouldCommit) {
      dragX.set(0);
      resetSwipeStyles();
      return;
    }

    const nextIndex = getWrappedIndex(
      activeIndexRef.current + (direction === 'next' ? 1 : -1)
    );
    const grid = gridRef.current;

    if (commitFrameRef.current !== null) {
      window.cancelAnimationFrame(commitFrameRef.current);
      commitFrameRef.current = null;
    }

    grid?.setAttribute('data-swipe-committing', 'true');
    dragX.set(0);

    if (trackRef.current) {
      trackRef.current.style.transform = 'none';
    }

    resetSwipeStyles();

    flushSync(() => {
      activeIndexRef.current = nextIndex;
      visualIndicatorIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      setVisualIndicatorIndex(nextIndex);

      if (selectedItem !== null) {
        onSelectSolution(selectedItem);
      }
    });

    commitFrameRef.current = window.requestAnimationFrame(() => {
      commitFrameRef.current = window.requestAnimationFrame(() => {
        grid?.removeAttribute('data-swipe-committing');
        commitFrameRef.current = null;
      });
    });
  };

  const finishSettlingSwipe = (selectedItem = null) => {
    const settlingSwipe = settlingSwipeRef.current;

    if (!isSettlingRef.current || settlingSwipe === null) {
      return;
    }

    swipeSequenceRef.current += 1;
    swipeAnimationRef.current?.stop();
    swipeAnimationRef.current = null;
    settlingSwipeRef.current = null;
    isSettlingRef.current = false;
    applySettledSwipe(
      settlingSwipe.direction,
      settlingSwipe.shouldCommit,
      selectedItem
    );
  };

  const settleSwipe = (direction, shouldCommit, velocity = 0) => {
    const swipeSequence = swipeSequenceRef.current + 1;
    const target = shouldCommit
      ? direction === 'next'
        ? -dragDistanceRef.current
        : dragDistanceRef.current
      : 0;

    swipeSequenceRef.current = swipeSequence;
    dragDirectionRef.current = direction;
    isSettlingRef.current = true;
    settlingSwipeRef.current = { direction, shouldCommit };
    swipeAnimationRef.current?.stop();
    const releaseVelocity = shouldCommit
      ? Math.max(
          -SWIPE_MAX_RELEASE_VELOCITY,
          Math.min(SWIPE_MAX_RELEASE_VELOCITY, velocity)
        )
      : 0;

    swipeAnimationRef.current = animate(dragX, target, {
      ...SWIPE_SPRING,
      velocity: releaseVelocity,
    });

    swipeAnimationRef.current.then(() => {
      if (swipeSequence !== swipeSequenceRef.current) {
        return;
      }

      settlingSwipeRef.current = null;
      isSettlingRef.current = false;
      swipeAnimationRef.current = null;
      applySettledSwipe(direction, shouldCommit);
    });
  };

  const showPrevious = () => {
    selectActiveIndex(activeIndexRef.current - 1);
  };

  const showNext = () => {
    selectActiveIndex(activeIndexRef.current + 1);
  };

  const handleCardActivation = (item, index) => {
    const settlingSwipe = settlingSwipeRef.current;

    if (isSettlingRef.current && settlingSwipe?.shouldCommit) {
      const settlingIndex = getWrappedIndex(
        activeIndexRef.current +
          (settlingSwipe.direction === 'next' ? 1 : -1)
      );

      if (index === settlingIndex) {
        finishSettlingSwipe(item);
        return;
      }
    }

    if (isDesktop || index === activeIndexRef.current) {
      onSelectSolution(item);
      return;
    }

    selectActiveIndex(index);
  };

  const getCardState = (index) => {
    if (index === activeIndex) {
      return 'active';
    }

    if (index === getWrappedIndex(activeIndex - 1)) {
      return 'previous';
    }

    if (index === getWrappedIndex(activeIndex + 1)) {
      return 'next';
    }

    if (index === getWrappedIndex(activeIndex - 2)) {
      return 'previousFar';
    }

    if (index === getWrappedIndex(activeIndex + 2)) {
      return 'nextFar';
    }

    return 'hidden';
  };

  const {
    handleCarouselClickCapture,
    handlePointerCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = createProtocolPointerHandlers({
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
  });

  return {
    carouselMaxHeight,
    cardRefs,
    dragX,
    getCardState,
    gridRef,
    handleCardActivation,
    handleCarouselClickCapture,
    handlePointerCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDesktop,
    selectActiveIndex,
    showNext,
    showPrevious,
    trackRef,
    visualIndicatorIndex,
  };
};

export default useProtocolCarousel;
