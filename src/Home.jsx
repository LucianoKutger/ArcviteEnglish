import React, { useCallback, useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import HomeSection from './components/sections/HomeSection';
import VisionSection from './components/sections/VisionSection';
import MethodologySection from './components/sections/MethodologySection';
import FounderSection from './components/sections/FounderSection';
import BioSyncSection from './components/sections/BioSyncSection';
import ProtocolsSection from './components/sections/ProtocolsSection';
import AuditSection from './components/sections/AuditSection';
import FaqSection from './components/sections/FaqSection';
import StudySection from './components/sections/StudySection';

const Home = () => {
  const location = useLocation();

  const shouldReduceMotion = useReducedMotion();
  const lenis = useLenis();

  const scrollBehavior = shouldReduceMotion ? 'auto' : 'smooth';

  const handledNavigationKeyRef = useRef(null);

  const scrollTarget = location.state?.scrollTarget;

  const scrollToSection = useCallback(
    (id) => {
      const target = id === 'home' ? 0 : document.getElementById(id);

      if (target === null) {
        return;
      }

      if (lenis && !shouldReduceMotion) {
        lenis.scrollTo(target);
        return;
      }

      if (id === 'home') {
        window.scrollTo({
          top: 0,
          behavior: scrollBehavior,
        });

        return;
      }

      target.scrollIntoView({
        behavior: scrollBehavior,
      });
    },
    [lenis, scrollBehavior, shouldReduceMotion]
  );

  useEffect(() => {
    if (!scrollTarget || handledNavigationKeyRef.current === location.key) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      handledNavigationKeyRef.current = location.key;
      scrollToSection(scrollTarget);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [location.key, scrollTarget, scrollToSection]);

  return (
    <main>
      <HomeSection scrollToSection={scrollToSection} />

      <VisionSection />
      <MethodologySection />
      <StudySection />
      <FounderSection />
      <BioSyncSection />

      <ProtocolsSection scrollToSection={scrollToSection} />

      <AuditSection />

      <FaqSection scrollToSection={scrollToSection} />
    </main>
  );
};

export default Home;
