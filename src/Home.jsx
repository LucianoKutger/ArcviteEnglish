import React from 'react';

import HomeSection from './components/sections/HomeSection';
import VisionSection from './components/sections/VisionSection';
import MethodologySection from './components/sections/MethodologySection';
import FounderSection from './components/sections/FounderSection';
import BioSyncSection from './components/sections/BioSyncSection';
import ProtocolsSection from './components/sections/ProtocolsSection';
import AuditSection from './components/sections/AuditSection';
import FaqSection from './components/sections/FaqSection';
import StudySection from './components/sections/StudySection'


const Home = () => {

  const scrollToSection = (id) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <main>

      <HomeSection scrollToSection={scrollToSection} />
      <VisionSection />
      <MethodologySection />
      <section>
        <StudySection />
      </section>
      <FounderSection />
      <BioSyncSection />
      <ProtocolsSection scrollToSection={scrollToSection} />
      <AuditSection />
      <FaqSection scrollToSection={scrollToSection} />

    </main>
  );
};

export default Home;