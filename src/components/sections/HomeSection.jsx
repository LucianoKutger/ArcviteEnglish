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
            className={styles.lpHeroGrid}
          >
            <div className={styles.lpHeroTextCol}>
              <h1 className={styles.lpHeroH1}>
                <span className={styles.heroGradientText}>
                  Your biology should not be the limit of your ambitions.
                </span>
              </h1>
              <p className={styles.lpHeroP}>
                We are your external operating system for maximum biological load capacity. We forge complex medical data into your precise, action-oriented blueprint. Performance without compromise.              </p>
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
          </motion.div>
        </div>
    </section>
  );
};

export default HomeSection;