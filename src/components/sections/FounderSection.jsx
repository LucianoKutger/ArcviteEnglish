import React from 'react';
import FadeOutSection from '../visuals/FadeoutSection';
import BackgroundGlow from '../visuals/BackgroundGlow';
import ResponsiveImage from '../ui/ResponsiveImage';
import { founderImage, imageSizes } from '../../data/responsiveImages';
import styles from './FounderSection.module.scss';

const FounderSection = () => {
  return (
    <FadeOutSection id="founder" className={styles.section}>
      <BackgroundGlow className="glow" variant="founder" />

      <div className={styles.gridContainer}>
        <div className={styles.textContent}>
          {/* --- NEU: Flex-Container für das Nebeneinander-Layout auf Mobile --- */}
          <div className={styles.headerFlexContainer}>
            <div className={styles.headerTextGroup}>
              <div className={styles.labelContainer}>
                <div className={styles.labelLine}></div>
                <span className={styles.labelText}>Our Founder</span>
              </div>

              <h2 className={styles.heading}>
                Human Biology.
                <br />
                Mathematically.
                <br />
                Optimized.
              </h2>
            </div>

            {/* --- NEU: Mobiles Bild (wird auf Desktop ausgeblendet) --- */}
            <div className={`${styles.imageContainer} ${styles.mobileImage}`}>
              <ResponsiveImage
                image={founderImage}
                variant="display"
                sizes={imageSizes.founder}
                pictureClassName={styles.founderPicture}
                className={styles.founderPic}
                loading="lazy"
                alt="founder"
              />
            </div>
          </div>

          <div className={styles.description}>
            <p>
              The Arc Model is the distillate of intensive systems theory and
              the analysis of people with an unrelenting obsession for their
              goals. It is a framework that makes invisible friction losses
              visible. We eliminate the gap between your vision and actual
              execution.
            </p>
          </div>

          <div className={styles.quoteBlock}>
            <p className={styles.quoteText}>
              "'All weakness is weakness of will."
            </p>
            <p className={styles.quoteAuthor}>— Friedrich Nietzsche</p>
          </div>

          <div className={styles.quoteBlock}>
            <p className={styles.quoteText}>
              "Arcvite is the architecture that takes over where human will
              fails."
            </p>
            <p className={styles.quoteAuthor}>— Andreas, Founder Arcvite</p>
          </div>
        </div>

        {/* --- VERÄNDERT: Klasse desktopImage hinzugefügt (wird auf Mobile ausgeblendet) --- */}
        <div className={`${styles.imageContainer} ${styles.desktopImage}`}>
          <ResponsiveImage
            image={founderImage}
            variant="display"
            sizes={imageSizes.founder}
            pictureClassName={styles.founderPicture}
            className={styles.founderPic}
            loading="lazy"
            alt="founder"
          />
        </div>
      </div>
    </FadeOutSection>
  );
};

export default FounderSection;
