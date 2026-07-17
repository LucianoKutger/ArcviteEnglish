import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useReducedMotion } from 'framer-motion';
import { useLenis } from 'lenis/react';

import useViewportActivity from '../../hooks/useViewportActivity';

const FADE_TRACKING_ROOT_MARGIN = '50% 0px';

const interpolate = (value, start, end, from, to) => {
  if (value <= start) return from;
  if (value >= end) return to;

  const progress = (value - start) / (end - start);

  return from + (to - from) * progress;
};

const setOpacity = (element, value) => {
  if (element) element.style.opacity = value.toFixed(3);
};

const FadeOutMotionController = ({
  backgroundLayerRef,
  contentLayerRef,
  delayPercentage,
  offsetTop,
  overlayLayerRef,
  sectionHeight,
}) => {
  const startPoint = offsetTop + sectionHeight * delayPercentage;

  const updateLayers = useCallback(
    (scrollSource) => {
      const latestScrollY =
        typeof scrollSource === 'number'
          ? scrollSource
          : (scrollSource?.scroll ?? window.scrollY);
      const contentOpacity = interpolate(
        latestScrollY,
        startPoint,
        startPoint + 400,
        1,
        0
      );
      const contentY = interpolate(
        latestScrollY,
        startPoint,
        startPoint + 500,
        0,
        150
      );
      const overlayOpacity = interpolate(
        latestScrollY,
        startPoint + 100,
        startPoint + 500,
        0,
        1
      );

      setOpacity(backgroundLayerRef.current, contentOpacity);
      setOpacity(contentLayerRef.current, contentOpacity);
      setOpacity(overlayLayerRef.current, overlayOpacity);

      if (contentLayerRef.current) {
        contentLayerRef.current.style.transform = `translate3d(0, ${contentY.toFixed(2)}px, 0)`;
      }
    },
    [
      backgroundLayerRef,
      contentLayerRef,
      overlayLayerRef,
      startPoint,
    ]
  );

  useLenis(updateLayers);

  useLayoutEffect(() => {
    updateLayers(window.scrollY);
  }, [updateLayers]);

  return null;
};

const FadeOutSection = ({ id, className, children, delayPercentage = 0.5 }) => {
  const [offsetTop, setOffsetTop] = useState(0);
  const [sectionHeight, setSectionHeight] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const { targetRef, isActive } = useViewportActivity({
    rootMargin: FADE_TRACKING_ROOT_MARGIN,
  });
  const backgroundLayerRef = React.useRef(null);
  const contentLayerRef = React.useRef(null);
  const overlayLayerRef = React.useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        setOffsetTop(rect.top + window.scrollY);
        setSectionHeight(rect.height);
      }
    };

    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleMediaChange = (event) => setIsDesktop(event.matches);

    setIsDesktop(mediaQuery.matches);
    updatePosition();

    mediaQuery.addEventListener('change', handleMediaChange);
    window.addEventListener('resize', updatePosition);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('resize', updatePosition);
    };
  }, [targetRef]);

  const motionEnabled = isDesktop && !shouldReduceMotion;
  const shouldTrackScroll = motionEnabled && isActive;

  useEffect(() => {
    if (motionEnabled) return;

    setOpacity(backgroundLayerRef.current, 1);
    setOpacity(contentLayerRef.current, 1);
    setOpacity(overlayLayerRef.current, 0);

    if (backgroundLayerRef.current) {
      backgroundLayerRef.current.style.transform = 'none';
    }

    if (contentLayerRef.current) {
      contentLayerRef.current.style.transform = 'none';
    }
  }, [motionEnabled]);

  const childrenArray = React.Children.toArray(children);
  const backgroundChildren = [];
  const contentChildren = [];

  childrenArray.forEach((child) => {
    if (React.isValidElement(child)) {
      const componentName =
        child.type?.name || (typeof child.type === 'string' ? child.type : '');
      const classNameProp = child.props?.className || '';
      const isBackground =
        componentName.toLowerCase().includes('glow') ||
        componentName.toLowerCase().includes('flow') ||
        classNameProp.toLowerCase().includes('glow') ||
        classNameProp.toLowerCase().includes('background') ||
        classNameProp.toLowerCase().includes('flow') ||
        classNameProp.toLowerCase().includes('effect');

      if (isBackground) {
        backgroundChildren.push(child);
      } else {
        contentChildren.push(child);
      }
    } else {
      contentChildren.push(child);
    }
  });

  return (
    <section
      id={id}
      className={className}
      ref={targetRef}
      data-scroll-tracking={shouldTrackScroll ? 'active' : 'paused'}
      style={{ position: 'relative' }}
    >
      {shouldTrackScroll && (
        <FadeOutMotionController
          backgroundLayerRef={backgroundLayerRef}
          contentLayerRef={contentLayerRef}
          delayPercentage={delayPercentage}
          offsetTop={offsetTop}
          overlayLayerRef={overlayLayerRef}
          sectionHeight={sectionHeight}
        />
      )}

      {backgroundChildren.length > 0 && (
        <div
          ref={backgroundLayerRef}
          data-motion-layer="background"
          style={{
            opacity: 1,
            transform: motionEnabled ? undefined : 'none',
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          {backgroundChildren}
        </div>
      )}

      <div
        ref={contentLayerRef}
        data-motion-layer="content"
        style={{
          opacity: 1,
          transform: 'none',
          width: '100%',
        }}
      >
        {contentChildren}
      </div>

      {motionEnabled && (
        <div
          ref={overlayLayerRef}
          data-motion-layer="overlay"
          style={{
            opacity: 0,
            position: 'absolute',
            inset: 0,
            backgroundColor: '#000000',
            pointerEvents: 'none',
            zIndex: 50,
          }}
        />
      )}
    </section>
  );
};

export default FadeOutSection;
