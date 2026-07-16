import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import FadeOutSection from '../visuals/FadeoutSection';
import SolutionCard from '../cards/SolutionCard';
import SolutionModal from '../ui/SolutionModal';
import { solutions } from '../../data/content'; // Pfad angepasst
import styles from './ProtocolsSection.module.scss';

const ProtocolsSection = ({ scrollToSection }) => {
  // Die Modal-Logik lebt jetzt lokal in dieser Section
  const [selectedSolution, setSelectedSolution] = useState(null);
  const navigate = useNavigate();
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

          <div className={styles.grid}>
            {solutions.map((item, idx) => (
              <SolutionCard
                key={item.id}
                item={item}
                onOpen={setSelectedSolution}
                image={item.image}
              />
            ))}
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
                * 15-minute professional consultation on equal terms - not a
                sales pitch.
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
