import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FAQItem from '../cards/Faq';
import ResponsiveImage from '../ui/ResponsiveImage';
import { faqs } from '../../data/content';
import { imageSizes, logoImage } from '../../data/responsiveImages';
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
                <ResponsiveImage
                  image={logoImage}
                  variant="display"
                  sizes={imageSizes.logo}
                  pictureClassName={styles.logoPicture}
                  loading="lazy"
                  alt="Arcvite Logo"
                />
              </div>
            </div>
            <div className={styles.linksContainer}>
              <Link to="/impressum" className={styles.footerLink}>Legal Notice</Link>
              <Link to="/datenschutz" className={styles.footerLink}>Privacy Policy</Link>
            </div>
            {/* Unnecessary copyrightContainer div removed for a flatter DOM */}
            <p className={styles.copyright}>© 2026 Arcvite</p>
        </div>
    </footer>
  );
};

export default FaqSection;
