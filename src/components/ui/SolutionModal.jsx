import React, { useEffect, useId, useRef } from 'react';

import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, ArrowUpRight } from 'lucide-react';
import { useLenis } from 'lenis/react';
import { imageSizes } from '../../data/responsiveImages';
import ResponsiveImage from './ResponsiveImage';
import styles from './SolutionModal.module.scss';

const SolutionModal = ({ item, onClose, onViewStudies }) => {
  const titleId = useId();
  const lenis = useLenis();

  const closeButtonRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!item) {
      return undefined;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const lenisWasStopped = lenis?.isStopped ?? false;

    lenis?.stop();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const modalElement = modalRef.current;

      if (!modalElement) {
        return;
      }

      const focusableElements = Array.from(
        modalElement.querySelectorAll(
          [
            'button:not([disabled])',
            'a[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
          ].join(',')
        )
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        modalElement.focus();
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement =
        focusableElements[focusableElements.length - 1];

      const activeElement = document.activeElement;
      const focusIsOutsideModal =
        activeElement instanceof Node && !modalElement.contains(activeElement);

      if (
        event.shiftKey &&
        (activeElement === firstFocusableElement || focusIsOutsideModal)
      ) {
        event.preventDefault();
        lastFocusableElement.focus();
        return;
      }

      if (
        !event.shiftKey &&
        (activeElement === lastFocusableElement || focusIsOutsideModal)
      ) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    };

    closeButtonRef.current?.focus({ preventScroll: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (!lenisWasStopped) {
        lenis?.start();
      }

      previouslyFocusedElement?.focus({ preventScroll: true });
    };
  }, [item, lenis, onClose]);

  const handleViewStudies = () => {
    onClose();
    onViewStudies();
  };

  if (!item) return null;

  return createPortal(
    <div className={styles.overlay}>
      <motion.div
        data-testid="solution-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className={styles.backdrop}
      />

      <motion.div
        layoutId={`card-${item.id}`}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={styles.modalCard}
      >
        <div className={styles.closeButtonContainer}>
          <button
            onClick={onClose}
            className={styles.closeButton}
            type="button"
            aria-label="Close modal"
            ref={closeButtonRef}
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
            <h2 id={titleId} className={styles.title}>
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
                <p className={styles.problemText}>"{item.problem}"</p>
              </div>

              <div>
                <div className={styles.sectionHeader}>
                  <div className={styles.solutionIndicator}></div>
                  <h4 className={styles.solutionLabel}>The Solution</h4>
                </div>
                <p className={styles.solutionText}>{item.solution}</p>
              </div>
            </div>

            <div className={styles.deepDiveCard}>
              <h4 className={styles.deepDiveLabel}>Deep Dive Protocol</h4>
              <p className={styles.deepDiveText}>{item.details}</p>

              <div className={styles.buttonContainer}>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={handleViewStudies}
                >
                  View related studies{' '}
                  <ArrowUpRight className={styles.iconSmall} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default SolutionModal;
