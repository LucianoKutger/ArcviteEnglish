import { useEffect, useState } from 'react';

export const LOCAL_SECTION_GLOW_MEDIA_QUERY = '(max-width: 1440px)';

const getBrowserWindow = () =>
  typeof window === 'undefined' ? undefined : window;

export const getMediaQueryMatch = (targetWindow) =>
  Boolean(
    targetWindow &&
      typeof targetWindow.matchMedia === 'function' &&
      targetWindow.matchMedia(LOCAL_SECTION_GLOW_MEDIA_QUERY).matches,
  );

const getInitialVisibility = () =>
  !getMediaQueryMatch(getBrowserWindow());

export default function useLocalSectionGlowVisibility() {
  const [shouldRenderLocalGlows, setShouldRenderLocalGlows] = useState(
    getInitialVisibility,
  );

  useEffect(() => {
    const browserWindow = getBrowserWindow();

    if (!browserWindow || typeof browserWindow.matchMedia !== 'function') {
      setShouldRenderLocalGlows((currentVisibility) =>
        currentVisibility ? currentVisibility : true,
      );
      return undefined;
    }

    const mediaQuery = browserWindow.matchMedia(
      LOCAL_SECTION_GLOW_MEDIA_QUERY,
    );
    const updateVisibility = ({ matches }) => {
      const nextVisibility = !matches;
      setShouldRenderLocalGlows((currentVisibility) =>
        currentVisibility === nextVisibility
          ? currentVisibility
          : nextVisibility,
      );
    };

    updateVisibility(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateVisibility);

      return () => {
        mediaQuery.removeEventListener('change', updateVisibility);
      };
    }

    mediaQuery.addListener?.(updateVisibility);

    return () => {
      mediaQuery.removeListener?.(updateVisibility);
    };
  }, []);

  return shouldRenderLocalGlows;
}
