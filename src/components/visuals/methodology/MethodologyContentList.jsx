import { AnimatePresence, motion } from 'framer-motion';

import { methodologySegments } from '../../../data/content';
import styles from '../MethodologySystem.module.scss';

const heightReferenceSegment = methodologySegments.find(
  (segment) => segment.title === 'Neuro-Biochemistry'
);

const MethodologyContentBody = ({ segment }) => (
  <>
    <p className={styles.infoDesc}>{segment.description}</p>

    {segment.listItems && (
      <div className={styles.detailsList}>
        {segment.listItems.map((item) => (
          <div key={item.label} className={styles.detailItem}>
            <div className={styles.detailHeader}>
              <div
                className={styles.detailDot}
                style={{ backgroundColor: segment.hex }}
              />
              <span
                className={styles.detailLabel}
                style={{ color: segment.hex }}
              >
                {item.label}
              </span>
            </div>
            <p className={styles.detailText}>{item.text}</p>
          </div>
        ))}
      </div>
    )}
  </>
);

const MethodologyHeightReference = () => (
  <div
    className={`${styles.textList} ${styles.heightReferenceList}`}
    aria-hidden="true"
    data-testid="methodology-height-reference"
  >
    {[...methodologySegments].reverse().map((segment) => (
      <div key={segment.id} className={styles.textListItem}>
        <div className={styles.segmentButton}>
          <span className={styles.headerRow}>
            <span className={styles.indicatorDot} />
            <span className={styles.subtitle}>{segment.subtitle}</span>
          </span>
          <span className={styles.infoTitle}>{segment.title}</span>
        </div>

        {segment.id === heightReferenceSegment?.id && (
          <div className={styles.expandedContent}>
            <MethodologyContentBody segment={segment} />
          </div>
        )}
      </div>
    ))}
  </div>
);

const MethodologyContentList = ({
  activeContentId,
  handleExitComplete,
  handleInteractionLeave,
  handleSegmentActivate,
  handleSegmentEnter,
  handleSegmentKeyDown,
  hoveredSegment,
  isDesktop,
  waitForCloseBeforeOpen,
}) => (
  <div
    className={styles.textWrapper}
    data-testid="methodology-text-wrapper"
    onMouseLeave={isDesktop ? handleInteractionLeave : undefined}
  >
    <div className={styles.textFrame}>
      <MethodologyHeightReference />

      <div className={styles.textViewport}>
        <div className={styles.textList}>
          {[...methodologySegments].reverse().map((segment) => {
            const isHovered = hoveredSegment?.id === segment.id;
            const isInactive = hoveredSegment !== null && !isHovered;
            const isContentActive = activeContentId === segment.id;
            const contentId = `methodology-content-${segment.id}`;
            const titleId = `methodology-title-${segment.id}`;

            return (
              <motion.div
                key={segment.id}
                className={`${styles.textListItem} ${
                  isInactive ? styles.dimmedItem : ''
                }`}
              >
                <button
                  type="button"
                  className={styles.segmentButton}
                  aria-expanded={isContentActive}
                  aria-controls={contentId}
                  onMouseEnter={
                    isDesktop ? () => handleSegmentEnter(segment) : undefined
                  }
                  onClick={() => handleSegmentActivate(segment)}
                  onKeyDown={(event) =>
                    handleSegmentKeyDown(event, segment)
                  }
                >
                  <span className={styles.headerRow}>
                    <span
                      className={styles.indicatorDot}
                      aria-hidden="true"
                      style={{
                        backgroundColor: isInactive
                          ? 'transparent'
                          : segment.hex,
                        borderColor: isInactive
                          ? 'rgba(255,255,255,0.2)'
                          : 'transparent',
                        boxShadow: isInactive
                          ? 'none'
                          : `0 0 15px ${segment.hex}`,
                      }}
                    />

                    <span
                      className={styles.subtitle}
                      style={{
                        color: isInactive
                          ? 'rgba(255,255,255,0.4)'
                          : segment.hex,
                      }}
                    >
                      {segment.subtitle}
                    </span>
                  </span>

                  <motion.span
                    id={titleId}
                    role="heading"
                    aria-level="2"
                    className={styles.infoTitle}
                    animate={{
                      scale: isHovered ? 1.05 : 1,
                      color: '#F0F4F8',
                    }}
                    style={{ originX: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {segment.title}
                  </motion.span>
                </button>

                <AnimatePresence
                  mode={waitForCloseBeforeOpen ? 'wait' : 'sync'}
                  initial={false}
                  onExitComplete={handleExitComplete}
                >
                  {isContentActive && (
                    <motion.div
                      key={`content-${segment.id}`}
                      id={contentId}
                      role="region"
                      aria-labelledby={titleId}
                      className={styles.expandedContent}
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: 'auto',
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        height: {
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        },
                        opacity: {
                          duration: 0.2,
                        },
                      }}
                    >
                      <MethodologyContentBody segment={segment} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

export default MethodologyContentList;
