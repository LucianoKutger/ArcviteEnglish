import { useEffect, useReducer, useState } from 'react';
import { useAnimationControls } from 'framer-motion';

import useViewportActivity from '../../../hooks/useViewportActivity';
import {
  initialMethodologyInteractionState,
  methodologyInteractionReducer,
} from '../../../utils/methodologyInteraction';
import {
  IMPACT_FLOW_ANIMATION,
  POLAR_STAR_ANIMATION,
} from './animations';

const useMethodologySystem = (waitForCloseBeforeOpen = true) => {
  const [{ hoveredSegment, activeContentId }, dispatchInteraction] = useReducer(
    methodologyInteractionReducer,
    initialMethodologyInteractionState
  );
  const [isDesktop, setIsDesktop] = useState(true);
  const { targetRef, isActive } = useViewportActivity();
  const impactFlowControls = useAnimationControls();
  const polarStarControls = useAnimationControls();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleMediaChange = (event) => {
      setIsDesktop(event.matches);

      dispatchInteraction({
        type: 'reset',
      });
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  useEffect(() => {
    if (!isActive) {
      impactFlowControls.stop();
      polarStarControls.stop();
      return undefined;
    }

    impactFlowControls.start(IMPACT_FLOW_ANIMATION);
    polarStarControls.start(POLAR_STAR_ANIMATION);

    return () => {
      impactFlowControls.stop();
      polarStarControls.stop();
    };
  }, [impactFlowControls, isActive, polarStarControls]);

  const handleSegmentEnter = (segment) => {
    dispatchInteraction({
      type: 'segment-enter',
      segment,
      waitForCloseBeforeOpen,
    });
  };

  const handleInteractionLeave = () => {
    dispatchInteraction({
      type: 'interaction-leave',
    });
  };

  const handleExitComplete = () => {
    dispatchInteraction({
      type: 'exit-complete',
      waitForCloseBeforeOpen,
    });
  };

  const handleSegmentClick = (segment) => {
    dispatchInteraction({
      type: 'segment-toggle',
      segment,
      waitForCloseBeforeOpen,
    });
  };

  const handleSegmentActivate = (segment) => {
    if (isDesktop) {
      handleSegmentEnter(segment);
      return;
    }

    handleSegmentClick(segment);
  };

  const handleSegmentKeyDown = (event, segment) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSegmentActivate(segment);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      handleInteractionLeave();
    }
  };

  return {
    activeContentId,
    handleExitComplete,
    handleInteractionLeave,
    handleSegmentActivate,
    handleSegmentClick,
    handleSegmentEnter,
    handleSegmentKeyDown,
    hoveredSegment,
    impactFlowControls,
    isDesktop,
    polarStarControls,
    targetRef,
  };
};

export default useMethodologySystem;
