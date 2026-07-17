import styles from './SolutionCard.module.scss';
import { AiOutlineExpandAlt } from 'react-icons/ai';
import { imageSizes } from '../../data/responsiveImages';
import ResponsiveImage from '../ui/ResponsiveImage';
import { motion } from 'framer-motion';

const SolutionCard = ({
  item,
  onOpen,
  image,
  className = '',
  tabIndex = 0,
  ariaHidden = false,
  ariaLabel = `Open ${item.title}`,
}) => {
  const handleOpen = () => {
    onOpen(item);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpen();
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={tabIndex}
      aria-hidden={ariaHidden || undefined}
      aria-label={ariaLabel}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className={`${styles.card} ${className}`.trim()}
    >
      <div className={styles.imageContainer}>
        <div className={styles.gridPattern} />
        <div className={styles.imageWrapper}>
          <ResponsiveImage
            image={image}
            variant="card"
            sizes={imageSizes.protocolCard}
            pictureClassName={styles.imagePicture}
            loading="lazy"
            alt=""
          />
        </div>
        <div className={styles.gradientOverlay} />
      </div>
      <div className={styles.content}>
        <div className={styles.topBar}>
          <div className={styles.iconGroup}></div>

          <div className={styles.idWrapper}>
            <AiOutlineExpandAlt size="1.5rem" color="#2DD4BF" />
          </div>
        </div>

        <h3 className={styles.title}>{item.title}</h3>

        <div className={styles.bodyWrapper}>
          <div className={styles.sectionHeader}>
            <div className={styles.problemDot}></div>
            <p className={styles.problemLabel}>Problem</p>
          </div>
          <p className={styles.problemText}>"{item.problem}"</p>

          <div className={styles.sectionHeader}>
            <div className={styles.solutionDot}></div>
            <p className={styles.solutionLabel}>Solution</p>
          </div>
          <p className={styles.solutionText}>{item.solution}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SolutionCard;
