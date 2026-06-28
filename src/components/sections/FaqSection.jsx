import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

import FAQItem from '../cards/Faq';
import ArcviteLogoPic from '../../assets/ArcviteLogoPic.png';
import { faqs } from '../../data/content'; 
import styles from './FaqSection.module.scss';

const FaqSection = ({ scrollToSection }) => {

  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  return (
    <footer id="faq" className={styles.section}>
       <div className={styles.faqSection}>
          <h3 className={styles.faqHeading}>Frequently Asked Questions</h3>
          <p className={styles.faqSubheading}>Transparency before implementation.</p>
          <div className={styles.faqContainer}>
            {faqs.map((faq, i) => (
              <FAQItem 
                key={i} 
                question={faq.question} 
                answer={faq.answer} 
                isOpen={openFaqIndex === i} 
                onToggle={() => setOpenFaqIndex(openFaqIndex === i ? null : i)} 
              />
            ))}
          </div>
        </div>
        
        <div className={styles.buttonWrapper}>
          <button 
            onClick={() => scrollToSection('audit')}
            className={styles.ctaButton}
          >
            <span className={styles.buttonContent}>
              Secure audit <ChevronRight className={styles.chevronIcon} />
            </span>
          </button>
        </div>

        <div className={styles.bottomFooter}>
            <div className={styles.logoContainer}>
              <div className={styles.logoWrapper} onClick={() => scrollToSection('home')}>
                <img src={ArcviteLogoPic} alt='Arcvite Logo'/>
              </div>
            </div>
            <div className={styles.linksContainer}>
              <a href="/impressum" className={styles.footerLink}>Legal Notice</a>
              <a href="/datenschutz" className={styles.footerLink}>Privacy Policy</a>
            </div>
            {/* Unnecessary copyrightContainer div removed for a flatter DOM */}
            <p className={styles.copyright}>© 2026 Arcvite</p>
        </div>
    </footer>
  );
};

export default FaqSection;