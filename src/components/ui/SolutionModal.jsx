import React from 'react';
import { motion } from "framer-motion";
import { X, ArrowUpRight } from 'lucide-react';
import { imageSizes } from '../../data/responsiveImages';
import ResponsiveImage from './ResponsiveImage';
import styles from './SolutionModal.module.scss';

const SolutionModal = ({ item, onClose }) => {

    if (!item) return null;

    return (
        <div className={styles.overlay}>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className={styles.backdrop}
            />
            
            <motion.div
                layoutId={`card-${item.id}`}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={styles.modalCard}
            >
                <div className={styles.closeButtonContainer}>
                    <button 
                        onClick={onClose}
                        className={styles.closeButton}
                    >
                        <X className={styles.closeIcon} />
                    </button>
                </div>

                <div className={styles.headerImageContainer}>
                    <ResponsiveImage
                        image={item.image}
                        variant="modal"
                        sizes={imageSizes.protocolModal}
                        pictureClassName={styles.headerPicture}
                        alt=""
                    />
                    <div className={styles.gridPattern} />
                    <div className={styles.gradientOverlay} />
                    <div className={styles.titleWrapper}>
                        <h2 className={styles.title}>
                            {item.title}
                        </h2>
                    </div>
                </div>

                <div 
                className={styles.contentContainer}
                data-lenis-prevent="true" 
                data-lenis-prevent-wheel="true"
                onWheel={(e) => e.stopPropagation()} 
                onTouchMove={(e) => e.stopPropagation()}
                >
                    <div className={styles.gridWrapper}>
                        <div className={styles.leftColumn}>
                             <div>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.problemIndicator}></div>
                                    <h4 className={styles.problemLabel}>The Problem</h4>
                                </div>
                                <p className={styles.problemText}>
                                    "{item.problem}"
                                </p>
                             </div>

                             <div>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.solutionIndicator}></div>
                                    <h4 className={styles.solutionLabel}>The Solution</h4>
                                </div>
                                <p className={styles.solutionText}>
                                    {item.solution}
                                </p>
                             </div>
                        </div>

                        <div className={styles.deepDiveCard}>
                            <h4 className={styles.deepDiveLabel}>Deep Dive Protocol</h4>
                            <p className={styles.deepDiveText}>
                                {item.details}
                            </p>
                            
                            <div className={styles.buttonContainer}>
                                <button className={styles.actionButton}>
                                    View related studies <ArrowUpRight className={styles.iconSmall} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SolutionModal;
