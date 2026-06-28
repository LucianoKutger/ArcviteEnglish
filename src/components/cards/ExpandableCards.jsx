import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import styles from "./ExpandableCards.module.scss";

const ExpandableCard = ({ 
  title, category, focusTitle, focusDesc, imageLabel, imageSrc, details, className = "", isOpen, onToggle, opacity, wide
}) => {
  const opacityVal = opacity ?? 1;

  return (
    /* Der Wrapper hält die Stellung im CSS-Grid */
    <div className={`${styles.cardWrapper} ${wide ? styles.cardWide : ''} ${className}`}>
      <motion.div 
        className={`${styles.card} ${isOpen ? styles.cardOpen : ''}`}
        onClick={onToggle}
        /* Direkte CSS-Height Animation statt unzuverlässigem Layout-Tracking */
        animate={{
          height: isOpen ? "auto" : "100%",
          zIndex: isOpen ? 50 : 10
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        <div className={styles.cardGradientOverlay} />
        
        <div className={styles.imageContainer}>
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={title} 
              className={styles.cardImage}
              style={{opacity: opacityVal}}
            />
          ) : (
            <>
              <div className={styles.fallbackPattern} />
              <div className={styles.fallbackCenter}>
                <div className={styles.fallbackLabel}>
                  [Bild: {imageLabel}]
                </div>
              </div>
            </>
          )}
          <div className={styles.imageBottomGradient} />
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.headerRow}>
            <h3 className={styles.title}>{title}</h3>
            <motion.div 
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className={styles.chevronWrapper}
            >
              <ChevronDown className={styles.chevronIcon} />
            </motion.div>
          </div>

          <div className={styles.focusSection}>
            <div className={styles.categoryRow}>
              <div className={styles.categoryLine}></div>
              <span className={styles.categoryText}>{category}</span>
            </div>
            <h4 className={styles.focusTitle}>{focusTitle}</h4>
            <p className={styles.focusDesc}>{focusDesc}</p>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={styles.detailsContainer}
              >
                <div className={styles.detailsList}>
                  {details.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={styles.detailItem}
                    >
                      <div className={styles.detailBullet} />
                      {item}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ExpandableCard;