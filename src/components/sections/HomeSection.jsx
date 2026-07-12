import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import HeroFlowLines from '../visuals/HeroFlowLines';
import styles from './HomeSection.module.scss';
import FadeOutSection from '../visuals/FadeoutSection';

const HomeSection = ({ scrollToSection }) => {
  return (
    <FadeOutSection
      id="home"
      className={styles.lpHeroSection}
      delayPercentage={0.2}
    >
      <HeroFlowLines />

      <div className={styles.lpHeroContainer}>
        <div className={styles.lpHeroContent}>
          {/* Überschrift über die volle Breite */}
          <h1 className={styles.lpHeroH1}>
            <span className={styles.heroGradientText}>
              Your medical <br className={styles.mobileBr} />
              data{' '}
            </span>
            <span className={styles.specialFont}>~ fused ~</span>
            <br className={styles.desktopBr} />
            <span className={styles.heroGradientText}>
              {' '}
              for <br className={styles.mobileBr} />
              peak performance
            </span>
          </h1>

          {/* Flexibles Grid: Text links nutzt den gesamten Restplatz, Button rechts komprimiert */}
          <div className={styles.lpHeroGrid}>
            <div className={styles.lpHeroTextCol}>
              <p className={styles.lpHeroP}>
                <span className={styles.desktopSubHeader}>
                  We are your external system for biological resilience and
                  precision data.{' '}
                </span>
                We transform complex biometric signals into precise,
                action-oriented blueprints for performance and health.
                Optimization and data-driven insights without compromise
              </p>
            </div>

            <div className={styles.lpHeroCtaCol}>
              <button
                onClick={() => scrollToSection('audit')}
                className={styles.lpCtaWrapperBtn}
              >
                <div className={styles.lpCtaInner}>
                  <span className={styles.lpHeroBtnText}>Secure audit</span>
                  <div className={styles.lpCtaIconBox}>
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
              <p className={styles.lpCapacityNote}>
                * Capacity strictly limited to 4 new newcomers per month to
                guarantee maximum quality of care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FadeOutSection>
  );
};

export default HomeSection;
