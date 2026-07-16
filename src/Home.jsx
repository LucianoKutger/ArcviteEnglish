import React, { useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';

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
          behavior: 'smooth',
        });

        return;
      }

      const element = document.getElementById(scrollTarget);

      element?.scrollIntoView({
        behavior: 'smooth',
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [location.key, scrollTarget]);

  const scrollToSection = (id) => {
    if (id === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    const element = document.getElementById(id);

    element?.scrollIntoView({
      behavior: 'smooth',
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
