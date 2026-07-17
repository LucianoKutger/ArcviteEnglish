import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import FadeOutSection from '../visuals/FadeoutSection';
import SolutionCard from '../cards/SolutionCard';
import SolutionModal from '../ui/SolutionModal';
import { solutions } from '../../data/content'; // Pfad angepasst
import styles from './ProtocolsSection.module.scss';

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';
const DESKTOP_BREAKPOINT = 1024;
const SWIPE_DISTANCE_RATIO = 0.72;
const SWIPE_FRONT_PROGRESS = 0.5;
const SWIPE_COMMIT_PROGRESS = 0.3;
const SWIPE_DIRECTION_LOCK_PX = 10;
const SWIPE_VERTICAL_BIAS = 1.35;
const SWIPE_FLICK_PROGRESS = 0.08;
const SWIPE_FLICK_VELOCITY = 420;
const SWIPE_DRAG_LIMIT = 1;
const SWIPE_MAX_RELEASE_VELOCITY = 900;
const SWIPE_SPRING = {
  type: 'spring',
  stiffness: 280,
  damping: 34,
  mass: 0.8,
};

const getInitialDesktopState = () => {
  if (typeof window === 'undefined') {
    return true;
  }

  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
  }

  return window.innerWidth >= DESKTOP_BREAKPOINT;
};

const getWrappedIndex = (index) =>
  (index + solutions.length) % solutions.length;

const ProtocolsSection = ({ scrollToSection }) => {
  // Die Modal-Logik lebt jetzt lokal in dieser Section
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visualIndicatorIndex, setVisualIndicatorIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(getInitialDesktopState);
  const [carouselMaxHeight, setCarouselMaxHeight] = useState(null);
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
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      const handleResize = () => {
        setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
      };

      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }

    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleMediaChange = (event) => setIsDesktop(event.matches);

    setIsDesktop(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

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

  useLayoutEffect(() => {
    if (isDesktop) {
      setCarouselMaxHeight(null);
      return undefined;
    }

    const cards = cardRefs.current.filter(Boolean);

    if (cards.length === 0) {
      return undefined;
    }

    const updateCarouselHeight = () => {
      const nextHeight = Math.max(...cards.map((card) => card.offsetHeight));
      const nextCardWidth = cards[0].offsetWidth;

      if (nextHeight > 0) {
        setCarouselMaxHeight(nextHeight);
      }

      if (nextCardWidth > 0) {
        dragDistanceRef.current = nextCardWidth * SWIPE_DISTANCE_RATIO;
      }
    };

    updateCarouselHeight();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateCarouselHeight);
      return () => window.removeEventListener('resize', updateCarouselHeight);
    }

    const resizeObserver = new ResizeObserver(updateCarouselHeight);
    cards.forEach((card) => resizeObserver.observe(card));

    return () => resizeObserver.disconnect();
  }, [isDesktop]);

  useEffect(() => {
    const updateSwipeStyles = (latestX) => {
      const grid = gridRef.current;

      if (!grid) {
        return;
      }

      const progress = Math.min(
        Math.abs(latestX) / dragDistanceRef.current,
        1
      );
      const direction =
        latestX < 0
          ? 'next'
          : latestX > 0
            ? 'previous'
            : dragDirectionRef.current;
      const nextVisualIndicatorIndex =
        progress >= SWIPE_FRONT_PROGRESS && direction !== 'idle'
          ? getWrappedIndex(
              activeIndexRef.current + (direction === 'next' ? 1 : -1)
            )
          : activeIndexRef.current;

      if (nextVisualIndicatorIndex !== visualIndicatorIndexRef.current) {
        visualIndicatorIndexRef.current = nextVisualIndicatorIndex;
        setVisualIndicatorIndex(nextVisualIndicatorIndex);
      }

      grid.dataset.swipeDirection = direction;
      grid.dataset.swipeFront =
        progress >= SWIPE_FRONT_PROGRESS ? 'incoming' : 'active';
      grid.style.setProperty('--swipe-progress', progress.toString());
      grid.style.setProperty('--active-scale', (1 - progress * 0.24).toString());
      grid.style.setProperty('--incoming-scale', (0.76 + progress * 0.24).toString());
      grid.style.setProperty('--outgoing-scale', (0.76 - progress * 0.08).toString());
      grid.style.setProperty('--far-scale', (0.68 + progress * 0.08).toString());
      grid.style.setProperty('--active-opacity', (1 - progress * 0.32).toString());
      grid.style.setProperty('--incoming-opacity', (0.68 + progress * 0.32).toString());
      grid.style.setProperty('--outgoing-opacity', (0.68 * (1 - progress)).toString());
      grid.style.setProperty('--far-opacity', (0.68 * progress).toString());
      grid.style.setProperty('--active-brightness', (1 - progress * 0.62).toString());
      grid.style.setProperty('--incoming-brightness', (0.38 + progress * 0.62).toString());
      grid.style.setProperty('--far-brightness', (0.3 + progress * 0.08).toString());
    };

    const unsubscribe = dragX.on('change', updateSwipeStyles);

    return unsubscribe;
  }, [dragX]);

  const resetSwipeStyles = () => {
    const grid = gridRef.current;

    dragDirectionRef.current = 'idle';

    if (!grid) {
      return;
    }

    grid.dataset.swipeDirection = 'idle';
    grid.dataset.swipeFront = 'active';
    grid.style.setProperty('--swipe-progress', '0');
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
        setSelectedSolution(selectedItem);
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
      setSelectedSolution(item);
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

    const currentX = dragX.get();
    const progress = Math.min(
      Math.abs(currentX) / dragDistanceRef.current,
      1
    );
    const velocity = dragX.getVelocity();
    const direction = currentX < 0 ? 'next' : 'previous';
    const shouldCommit =
      progress >= SWIPE_COMMIT_PROGRESS ||
      (progress >= SWIPE_FLICK_PROGRESS &&
        Math.abs(velocity) >= SWIPE_FLICK_VELOCITY);

    settleSwipe(direction, shouldCommit, velocity);
    releaseSuppressedClick();
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

    const currentX = dragX.get();
    const progress = Math.min(
      Math.abs(currentX) / dragDistanceRef.current,
      1
    );
    const velocity = dragX.getVelocity();
    const direction = currentX < 0 ? 'next' : 'previous';
    const shouldCommit =
      progress >= SWIPE_COMMIT_PROGRESS ||
      (progress >= SWIPE_FLICK_PROGRESS &&
        Math.abs(velocity) >= SWIPE_FLICK_VELOCITY);

    settleSwipe(direction, shouldCommit, velocity);
    releaseSuppressedClick();
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

  return (
    <FadeOutSection
      id="protokolle"
      className={styles.section}
      delayPercentage={0.65}
    >
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h2 className={styles.title}>
            The Arcvite <br /> Full-Spectrum Solution
          </h2>
          <p className={styles.subtitle}>
            We master the complexity of your biology – so that you can
            concentrate on your daily life.
          </p>
        </div>

        <div className={styles.contentBox}>
          <div className={styles.gradientBackground} />

          <div
            className={styles.carousel}
            role="region"
            aria-roledescription="carousel"
            aria-label="Arcvite protocols"
          >
            <div
              ref={gridRef}
              className={styles.grid}
              data-swipe-direction="idle"
              data-swipe-front="active"
              style={
                !isDesktop && carouselMaxHeight
                  ? { height: `${carouselMaxHeight}px` }
                  : undefined
              }
              onClickCapture={handleCarouselClickCapture}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              <motion.div
                ref={trackRef}
                className={styles.carouselTrack}
                style={{ x: dragX }}
              >
                {solutions.map((item, index) => {
                  const cardState = getCardState(index);
                  const isCarouselCardVisible =
                    cardState === 'active' ||
                    cardState === 'previous' ||
                    cardState === 'next';
                  const canOpenCard = isDesktop || cardState === 'active';

                  return (
                    <div
                      key={item.id}
                      ref={(node) => {
                        cardRefs.current[index] = node;
                      }}
                      className={`${styles.carouselCardSlot} ${styles[cardState]}`}
                    >
                      <SolutionCard
                        item={item}
                        onOpen={() => handleCardActivation(item, index)}
                        image={item.image}
                        className={styles.carouselCard}
                        tabIndex={isDesktop || isCarouselCardVisible ? 0 : -1}
                        ariaHidden={!isDesktop && !isCarouselCardVisible}
                        ariaLabel={`${canOpenCard ? 'Open' : 'Show'} ${item.title}`}
                      />
                    </div>
                  );
                })}
              </motion.div>

              <div className={styles.arrowRail}>
                <button
                  type="button"
                  className={`${styles.carouselArrow} ${styles.previousArrow}`}
                  onClick={showPrevious}
                  aria-label="Previous protocol"
                >
                  <ChevronLeft aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className={`${styles.carouselArrow} ${styles.nextArrow}`}
                  onClick={showNext}
                  aria-label="Next protocol"
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className={styles.indicators} aria-label="Choose a protocol">
              {solutions.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.indicator}
                  onClick={() => selectActiveIndex(index)}
                  aria-label={`Show ${item.title} protocol`}
                  aria-current={
                    index === visualIndicatorIndex ? 'true' : undefined
                  }
                />
              ))}
            </div>
          </div>

          <div className={styles.bottomSection}>
            <p className={styles.quote}>
              <strong className={styles.strongP}>
                Clear performance guarantee
              </strong>
              <br />
              We work with you
              <br />
              until the contractually fixed goals are achieved
              <br />
              <strong className={styles.strongP}>at no additional cost.</strong>
            </p>

            <div className={styles.buttonWrapper}>
              <button
                onClick={() => scrollToSection('audit')}
                className={styles.ctaButton}
              >
                <span className={styles.buttonContent}>
                  Secure audit <ChevronRight className={styles.chevronIcon} />
                </span>
              </button>
              <p className={styles.disclaimer}>
                <span>*15-minute professional consultation on equal terms</span>{' '}
                <span className={styles.mobileDisclaimerLine}>
                  - not a sales pitch
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedSolution && (
          <SolutionModal
            item={selectedSolution}
            onClose={() => setSelectedSolution(null)}
            onViewStudies={() => navigate('/studies')}
          />
        )}
      </AnimatePresence>
    </FadeOutSection>
  );
};

export default ProtocolsSection;
