import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

import HeroFlowLines from '../visuals/HeroFlowLines';
import styles from './HomeSection.module.scss'; 

const HomeSection = ({ scrollToSection }) => {

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <section id="home" className={styles.lpHeroSection}>
         <HeroFlowLines />
        
        <div className={styles.lpHeroContainer}>
          <motion.div 
            style={{ opacity: heroOpacity, y: heroY }} 
            className={styles.lpHeroContent}
          >
            {/* Überschrift über die volle Breite */}
            <h1 className={styles.lpHeroH1}>
              <span className={styles.heroGradientText}>
                Your medical data <span className={styles.specialFont}>~ fused ~</span><br/> for peak performance
              </span>
            </h1>

            {/* Flexibles Grid: Text links nutzt den gesamten Restplatz, Button rechts komprimiert */}
            <div className={styles.lpHeroGrid}>
              <div className={styles.lpHeroTextCol}>
                <p className={styles.lpHeroP}>
                  We are your external system for biological resilience and precision data. We transform complex biometric signals into precise, action-oriented blueprints for performance and health. Optimization and data-driven insights without compromise
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
                  * Capacity strictly limited to 4 new newcomers per month to guarantee maximum quality of care.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
    </section>
  );
};

export default HomeSection;