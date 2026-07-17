import { useEffect, useLayoutEffect, useState } from 'react';

import {
  DESKTOP_BREAKPOINT,
  DESKTOP_MEDIA_QUERY,
  SWIPE_DISTANCE_RATIO,
} from './carouselConfig';

const getInitialDesktopState = () => {
  if (typeof window === 'undefined') {
    return true;
  }

  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
  }

  return window.innerWidth >= DESKTOP_BREAKPOINT;
};

const useProtocolCarouselLayout = (cardRefs, dragDistanceRef) => {
  const [isDesktop, setIsDesktop] = useState(getInitialDesktopState);
  const [carouselMaxHeight, setCarouselMaxHeight] = useState(null);

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

  return {
    carouselMaxHeight,
    isDesktop,
  };
};

export default useProtocolCarouselLayout;
