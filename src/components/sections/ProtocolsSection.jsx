import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import FadeOutSection from '../visuals/FadeoutSection';
import SolutionModal from '../ui/SolutionModal';
import ProtocolCarousel from './protocols/ProtocolCarousel';
import useProtocolCarousel from './protocols/useProtocolCarousel';
import styles from './ProtocolsSection.module.scss';

const ProtocolsSection = ({ scrollToSection }) => {
  const [selectedSolution, setSelectedSolution] = useState(null);
  const navigate = useNavigate();
  const carousel = useProtocolCarousel({
    onSelectSolution: setSelectedSolution,
  });

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

          <ProtocolCarousel carousel={carousel} />

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
                <span>*15-minute professional consultation on equal terms</span>{' '}
                <span className={styles.mobileDisclaimerLine}>
                  - not a sales pitch
                </span>
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
