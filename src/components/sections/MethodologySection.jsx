import React from 'react';
import FadeOutSection from '../visuals/FadeoutSection';
import MethodologySystem from '../visuals/MethodologySystem';
import styles from './MethodologySection.module.scss';
import useLocalSectionGlowVisibility from '../../hooks/useLocalSectionGlowVisibility';

const MethodologySection = () => {
  const shouldRenderLocalGlows = useLocalSectionGlowVisibility();

  return (
    <FadeOutSection id="methodik" className={styles.section}>
      {shouldRenderLocalGlows && (
        <div
          className={styles.backgroundEffect}
          data-testid="methodology-local-glow"
        >
          <div className={styles.glowBlob} />
        </div>
      )}
      <div className={styles.contentWrapper}>
        <div className={styles.flexContainer}>
          <div className={styles.textColumn}>
            <h2 className={styles.headline}>
              The Arc System <br />
              <span className={styles.subHeadline}>
                The Excellence Standard
              </span>
            </h2>
            <p className={styles.description}>
              The Arc-System is the technical infrastructure for your biology.
              We view biology as engineering. Where conventional approaches rely
              on intuition, we utilize precise medical analytics for maximum
              resilience.
            </p>
          </div>
          <div className={styles.componentWrapper}>
            <MethodologySystem waitForCloseBeforeOpen={false} />
          </div>
        </div>
      </div>
    </FadeOutSection>
  );
};

export default MethodologySection;
