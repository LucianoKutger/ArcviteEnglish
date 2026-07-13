import { useEffect, useRef, useState } from 'react';

const DEFAULT_ROOT_MARGIN = '250px 0px';

const getDocumentVisibility = () => {
  if (typeof document === 'undefined') return true;

  return document.visibilityState === 'visible';
};

export default function useViewportActivity({
  rootMargin = DEFAULT_ROOT_MARGIN,
} = {}) {
  const targetRef = useRef(null);
  const [isNearViewport, setIsNearViewport] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    getDocumentVisibility,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const updateDocumentVisibility = () => {
      const nextVisibility = document.visibilityState === 'visible';
      setIsDocumentVisible((currentVisibility) =>
        currentVisibility === nextVisibility
          ? currentVisibility
          : nextVisibility,
      );
    };

    updateDocumentVisibility();
    document.addEventListener('visibilitychange', updateDocumentVisibility);

    const target = targetRef.current;
    let observer;

    if (target && typeof window.IntersectionObserver === 'function') {
      observer = new window.IntersectionObserver(
        ([entry]) => {
          const nextIsNearViewport = entry?.isIntersecting ?? true;
          setIsNearViewport((currentIsNearViewport) =>
            currentIsNearViewport === nextIsNearViewport
              ? currentIsNearViewport
              : nextIsNearViewport,
          );
        },
        { rootMargin, threshold: 0 },
      );
      observer.observe(target);
    } else {
      setIsNearViewport((currentIsNearViewport) =>
        currentIsNearViewport ? currentIsNearViewport : true,
      );
    }

    return () => {
      observer?.disconnect();
      document.removeEventListener(
        'visibilitychange',
        updateDocumentVisibility,
      );
    };
  }, [rootMargin]);

  return {
    targetRef,
    isActive: isNearViewport && isDocumentVisible,
  };
}
