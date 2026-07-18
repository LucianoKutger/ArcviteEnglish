import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { solutions } from '../../data/content';
import FadeOutSection from '../visuals/FadeoutSection';
import SolutionModal from '../ui/SolutionModal';
import ProtocolCarousel from './protocols/ProtocolCarousel';
import {
  DESKTOP_BREAKPOINT,
  DESKTOP_MEDIA_QUERY,
} from './protocols/carouselConfig';
import useProtocolCarousel from './protocols/useProtocolCarousel';
import styles from './ProtocolsSection.module.scss';

const BIOLOGICAL_RISK_MANAGEMENT_INDEX = solutions.findIndex(
  ({ title }) => title === 'Biological Risk Management'
);

const getInitialCarouselIndex = () => {
  if (
    BIOLOGICAL_RISK_MANAGEMENT_INDEX < 0 ||
    typeof window === 'undefined'
  ) {
    return 0;
  }

  const isDesktop =
    typeof window.matchMedia === 'function'
      ? window.matchMedia(DESKTOP_MEDIA_QUERY).matches
      : window.innerWidth >= DESKTOP_BREAKPOINT;

  return isDesktop ? 0 : BIOLOGICAL_RISK_MANAGEMENT_INDEX;
};

const ProtocolsSection = ({ scrollToSection }) => {
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [initialCarouselIndex] = useState(getInitialCarouselIndex);
  const navigate = useNavigate();
  const carousel = useProtocolCarousel({
    initialActiveIndex: initialCarouselIndex,
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
