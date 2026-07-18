import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import SolutionCard from '../../cards/SolutionCard';
import { solutions } from '../../../data/content';
import styles from '../ProtocolsSection.module.scss';
import { MOBILE_ACTIVE_CARD_SCALE } from './carouselConfig';

const ProtocolCarousel = ({ carousel }) => (
  <div
    className={styles.carousel}
    role="region"
    aria-roledescription="carousel"
    aria-label="Arcvite protocols"
  >
    <div
      ref={carousel.gridRef}
      className={styles.grid}
      data-swipe-direction="idle"
      data-swipe-front="active"
      style={
        !carousel.isDesktop && carousel.carouselMaxHeight
          ? {
              height: `${carousel.carouselMaxHeight * MOBILE_ACTIVE_CARD_SCALE}px`,
              '--carousel-card-height': `${carousel.carouselMaxHeight}px`,
            }
          : undefined
      }
      onClickCapture={carousel.handleCarouselClickCapture}
      onPointerDown={carousel.handlePointerDown}
      onPointerMove={carousel.handlePointerMove}
      onPointerUp={carousel.handlePointerUp}
      onPointerCancel={carousel.handlePointerCancel}
    >
      <motion.div
        ref={carousel.trackRef}
        className={styles.carouselTrack}
        style={{ x: carousel.dragX }}
      >
        {solutions.map((item, index) => {
          const cardState = carousel.getCardState(index);
          const isCarouselCardVisible =
            cardState === 'active' ||
            cardState === 'previous' ||
            cardState === 'next';
          const canOpenCard = carousel.isDesktop || cardState === 'active';

          return (
            <div
              key={item.id}
              ref={(node) => {
                carousel.cardRefs.current[index] = node;
              }}
              data-protocol-card-index={index}
              className={`${styles.carouselCardSlot} ${styles[cardState]}`}
            >
              <SolutionCard
                item={item}
                onOpen={() => carousel.handleCardActivation(item, index)}
                image={item.image}
                className={styles.carouselCard}
                tabIndex={carousel.isDesktop || isCarouselCardVisible ? 0 : -1}
                ariaHidden={!carousel.isDesktop && !isCarouselCardVisible}
                ariaLabel={`${canOpenCard ? 'Open' : 'Show'} ${item.title}`}
              />
            </div>
          );
        })}
      </motion.div>

      <div className={styles.arrowRail}>
        <button
          type="button"
          className={`${styles.carouselArrow} ${styles.previousArrow}`}
          onClick={carousel.showPrevious}
          aria-label="Previous protocol"
        >
          <ChevronLeft aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`${styles.carouselArrow} ${styles.nextArrow}`}
          onClick={carousel.showNext}
          aria-label="Next protocol"
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>

    <div className={styles.indicators} aria-label="Choose a protocol">
      {solutions.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={styles.indicator}
          onClick={() => carousel.selectActiveIndex(index)}
          aria-label={`Show ${item.title} protocol`}
          aria-current={
            index === carousel.visualIndicatorIndex ? 'true' : undefined
          }
        />
      ))}
    </div>
  </div>
);

export default ProtocolCarousel;
