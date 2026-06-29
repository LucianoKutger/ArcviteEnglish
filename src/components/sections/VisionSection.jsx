import React from 'react';
import { Infinity, Shield, Brain } from 'lucide-react';
import FadeOutSection from '../visuals/FadeoutSection';
import BackgroundGlow from '../visuals/BackgroundGlow';
import styles from './VisionSection.module.scss';

const VisionSection = () => {
  return (
    <FadeOutSection id="vision" className={styles.section}>
      <BackgroundGlow className="glow" variant='vision' />
      
       <div className={styles.backgroundWrapper}>
          <div className={styles.glowEffect} />
        </div>

        <div className={styles.container}>
          <h2 className={styles.heading}>
            The New Standard of Leadership
          </h2>
          
          <div className={styles.textContent}>
            <p>
              <strong className={styles.strongText}>A company is only as resilient as its leadership level.</strong> 
            </p>
            <p className={styles.pText}>
              But while every key figure in business is meticulously optimized, 
              the most important <br/>component, human biology, 
              is often left to chance.
            </p>
            <p>
              <strong className={styles.strongText}>The consequence?</strong>
              <strong className={styles.strongText}> &#10140; An invisible limit.</strong>
            </p>
            <p className={styles.pText}>
             Despite unwavering discipline, one's own body becomes the bottleneck for the next growth level. Brain fog during critical decisions, the inevitable energy crash in the afternoon, and the creeping feeling that business success is paid for with one's own substance.
            </p>
            <p>
              <strong className={styles.strongText}>Arcvite was founded to close this gap.</strong>
            </p>
            <p className={styles.pText}>
              We understand health not as a lifestyle attribute, but as a high-performance<br/>structure. 
              Based on our proprietary arch model (the Arc-System), we build<br/>a foundation that goes far beyond conventional analysis.
            </p>
            <p>
              <strong className={styles.strongText}>Our Goal<br/><br/>You stand at the top not despite, but because of your physical and<br/>mental condition.</strong>
            </p>
          </div>
          
          <div className={styles.featuresGrid}>
            {[
              { title: "Lifespan", desc: "Optimizing health-span metrics through data-driven management.", icon: <Infinity className={styles.featureIcon} /> },
              { title: "Resilience", desc: "Enhancing biological resilience to sustain peak performance.", icon: <Shield className={styles.featureIcon} /> },
              { title: "Clarity", desc: "Supporting cognitive focus through precision data insights and metabolic optimization.", icon: <Brain className={styles.featureIcon} /> },
            ].map((item, i) => (
              <div key={i} className={styles.featureItem}>
                <div className={styles.iconWrapper}>
                    {item.icon}
                </div>
                <div>
                  <h3 className={styles.featureTitle}>{item.title}</h3>
                </div>
                <div>
                  <p className={styles.featureDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

    </FadeOutSection>
  );
};

export default VisionSection;