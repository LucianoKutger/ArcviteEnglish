import React, { useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
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

  const scrollBehavior = shouldReduceMotion ? 'auto' : 'smooth';

  const handledNavigationKeyRef = useRef(null);

  const scrollTarget = location.state?.scrollTarget;

  useEffect(() => {
    if (!scrollTarget || handledNavigationKeyRef.current === location.key) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      handledNavigationKeyRef.current = location.key;

      if (scrollTarget === 'home') {
        window.scrollTo({
          top: 0,
          behavior: scrollBehavior,
        });

        return;
      }

      const element = document.getElementById(scrollTarget);

      element?.scrollIntoView({
        behavior: scrollBehavior,
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [location.key, scrollTarget, scrollBehavior]);

  const scrollToSection = (id) => {
    if (id === 'home') {
      window.scrollTo({
        top: 0,
        behavior: scrollBehavior,
      });

      return;
    }

    const element = document.getElementById(id);

    element?.scrollIntoView({
      behavior: scrollBehavior,
    });
  };

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
