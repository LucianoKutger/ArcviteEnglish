import React from 'react';
import FadeOutSection from '../visuals/FadeoutSection';
import BackgroundGlow from '../visuals/BackgroundGlow';
import styles from './FounderSection.module.scss';

const FounderSection = () => {
  return (
    <FadeOutSection id="founder" className={styles.section}>
      <BackgroundGlow className="glow" variant='founder' />
      
      <div className={styles.gridContainer}>
        
          <div className={styles.textContent}>
            <div className={styles.labelContainer}>
              <div className={styles.labelLine}></div>
              <span className={styles.labelText}>Our Founder</span>
            </div>

            <h2 className={styles.heading}>
              "IF YOU THINK BIG,<br />
              <span className={styles.faded}>TRY THINKING BIGGER."</span>
            </h2>

            <div className={styles.description}>
              <p>
                The arch model is the distillate of intensive systems theory and the analysis of people with an unrelenting obsession for their goals. It is a framework that makes invisible friction losses visible. We eliminate the gap between your vision and actual execution.
              </p>
            </div>
            
            <div className={styles.quoteBlock}>
              <p className={styles.quoteText}>
                "'All weakness is weakness of will."
              </p>
              <p className={styles.quoteAuthor}>
                — Friedrich Nietzsche
              </p>
            </div>

            {/* Changed from quoteBlockLast to quoteBlock, leveraging SCSS :last-of-type */}
            <div className={styles.quoteBlock}>
              <p className={styles.quoteText}>
                "Arcvite is the architecture that takes over where human will fails."
              </p>
              <p className={styles.quoteAuthor}>
                — Andreas, Founder Arcvite
              </p>
            </div>

          </div>

          <div className={styles.imageContainer}>
              <div className={styles.imagePattern} />
              
              <div className={styles.imagePlaceholderText}>
                [Bild: Andreas <br/> (weicher Übergang in den Hintergrund)]
              </div>
          </div>

        </div>

    </FadeOutSection>
  );
};

export default FounderSection;