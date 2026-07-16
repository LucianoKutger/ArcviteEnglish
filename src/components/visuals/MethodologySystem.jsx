import React, { useEffect, useReducer, useState } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import styles from './MethodologySystem.module.scss';
import { methodologySegments } from '../../data/content';
import useViewportActivity from '../../hooks/useViewportActivity';
import {
  getPointyArcPath,
  polarToCartesian,
} from '../../utils/methodologyGeometry';
import {
  initialMethodologyInteractionState,
  methodologyInteractionReducer,
} from '../../utils/methodologyInteraction';

const IMPACT_FLOW_ANIMATION = {
  pathOffset: [-0.15, 1],
  opacity: [0.5, 1, 0.5],
  strokeWidth: [2, 6, 2],
  transition: {
    pathOffset: { duration: 4, repeat: Infinity, ease: 'linear' },
    opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    strokeWidth: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const POLAR_STAR_ANIMATION = {
  r: 14,
  opacity: 0,
  transition: { duration: 2.5, repeat: Infinity, ease: 'easeOut' },
};

const ArcSystem = () => {
  const [{ hoveredSegment, activeContentId }, dispatchInteraction] = useReducer(
    methodologyInteractionReducer,
    initialMethodologyInteractionState
  );

  // 4. Fix -> Wieder hinzugefügt für das Hover-Verhalten des "YOU"-Zentrums!
  const [isCenterHovered, setIsCenterHovered] = useState(false);

  const [isDesktop, setIsDesktop] = useState(true);
  const { targetRef, isActive } = useViewportActivity();
  const impactFlowControls = useAnimationControls();
  const polarStarControls = useAnimationControls();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleMediaChange = (e) => setIsDesktop(e.matches);

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  useEffect(() => {
    if (!isActive) {
      impactFlowControls.stop();
      polarStarControls.stop();
      return undefined;
    }

    impactFlowControls.start(IMPACT_FLOW_ANIMATION);
    polarStarControls.start(POLAR_STAR_ANIMATION);

    return () => {
      impactFlowControls.stop();
      polarStarControls.stop();
    };
  }, [impactFlowControls, isActive, polarStarControls]);

  // --- GEOMETRIE LOGIK ---
  const centerX = 120;
  const centerY = 580;

  const arrowStart = polarToCartesian(centerX, centerY, 580, 45);
  const arrowEnd = polarToCartesian(centerX, centerY, 15, 45);
  const polarStarPoint = polarToCartesian(centerX, centerY, 540, 45);

  const handleMouseEnter = (segment) => {
    dispatchInteraction({
      type: 'segment-enter',
      segment,
    });
  };

  const handleInteractionLeave = () => {
    dispatchInteraction({
      type: 'interaction-leave',
    });
  };

  const handleExitComplete = () => {
    dispatchInteraction({
      type: 'exit-complete',
    });
  };

  const handleSegmentClick = (segment) => {
    dispatchInteraction({
      type: 'segment-toggle',
      segment,
    });
  };

  return (
    <div ref={targetRef} className={styles.container}>
      {/* LINKSEITE: DAS SVG MODELL */}
      <div
        className={styles.visualWrapper}
        onMouseLeave={isDesktop ? handleInteractionLeave : undefined}
      >
        <svg viewBox="0 0 700 700" className={styles.svgGraph}>
          <defs>
            {methodologySegments.map((s) => (
              <linearGradient
                key={`grad-arc-${s.id}`}
                id={`grad-arc-${s.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" style={{ stopColor: s.hex }} />
                <stop
                  offset="50%"
                  style={{ stopColor: s.hex, filter: 'brightness(1.4)' }}
                />
                <stop offset="100%" style={{ stopColor: s.hex }} />
              </linearGradient>
            ))}
            <linearGradient
              id="flow-energy-white"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <marker
              id="arrow-to-center-bright"
              markerWidth="20"
              markerHeight="12"
              refX="18"
              refY="6"
              orient="auto"
            >
              <polygon points="0 0, 18 6, 0 12" fill="white" />
            </marker>
            <marker
              id="indicator-arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#CED4DA"
                fillOpacity="0.4"
              />
            </marker>
            <filter id="glow-model-meth">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Impact Flow Line */}
          <g>
            <line
              x1={arrowStart.x}
              y1={arrowStart.y}
              x2={arrowEnd.x}
              y2={arrowEnd.y}
              stroke="white"
              strokeWidth="1.3"
              strokeOpacity="0.8"
              markerEnd="url(#arrow-to-center-bright)"
            />
            <motion.line
              x1={arrowStart.x}
              y1={arrowStart.y}
              x2={arrowEnd.x}
              y2={arrowEnd.y}
              stroke="url(#flow-energy-white)"
              strokeLinecap="round"
              initial={{ pathLength: 0.15, pathOffset: -0.15, opacity: 0 }}
              animate={impactFlowControls}
              style={{
                filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.9))',
              }}
            />
            <text
              x={polarToCartesian(centerX, centerY, 600, 45).x + 12}
              y={polarToCartesian(centerX, centerY, 600, 45).y - 5}
              fill="white"
              fillOpacity="0.75"
              fontSize="10"
              letterSpacing="0.5em"
              className={styles.impactFlowLabel}
            >
              Impact Flow
            </text>
          </g>

          {/* Center Point "YOU" */}
          <g
            className={styles.interactiveGroup}
            onMouseEnter={() => setIsCenterHovered(true)}
            onMouseLeave={() => setIsCenterHovered(false)}
          >
            <motion.circle
              cx={centerX}
              cy={centerY}
              animate={{
                r: isCenterHovered ? 20 : 10,
                opacity: isCenterHovered ? 0.25 : 0.08,
              }}
              fill="white"
            />
            <motion.circle
              cx={centerX}
              cy={centerY}
              animate={{
                r: isCenterHovered ? 7 : 4,
                fill: isCenterHovered ? '#fff' : 'rgba(255, 255, 255,0.7)',
              }}
              fill="white"
            />
            <motion.line
              x1={centerX}
              y1={centerY + 55}
              x2={centerX}
              y2={centerY + 12}
              stroke="#CED4DA"
              strokeWidth="0.8"
              strokeDasharray="3 3"
              strokeOpacity="0.4"
              markerEnd="url(#indicator-arrowhead)"
            />
            <text
              x={centerX}
              y={centerY + 75}
              textAnchor="middle"
              fill="#FFFF"
              className={styles.svgLabel}
              style={{
                filter: 'drop-shadow(0 0 10px rgba(229, 217, 182, 0.3))',
              }}
            >
              YOU
            </text>
          </g>

          {/* The Arcs (Stripes) */}
          {methodologySegments.map((s) => {
            const isHovered = hoveredSegment?.id === s.id;
            const isInactive = hoveredSegment !== null && !isHovered;
            const r = isHovered ? s.radius + 12 : s.radius;
            const t = isHovered ? s.thickness * 1.6 : s.thickness;

            return (
              <g
                key={s.id}
                className={styles.interactiveGroup}
                onMouseEnter={isDesktop ? () => handleMouseEnter(s) : undefined}
                onClick={!isDesktop ? () => handleSegmentClick(s) : undefined}
              >
                <path
                  d={getPointyArcPath(
                    centerX,
                    centerY,
                    s.radius,
                    -5,
                    100,
                    s.thickness + 20
                  )}
                  fill="transparent"
                  className={styles.interactiveHitArea}
                />
                <motion.path
                  animate={{
                    d: getPointyArcPath(centerX, centerY, r, 10, 80, t),
                    fillOpacity: isInactive ? 0.05 : 1,
                  }}
                  fill={`url(#grad-arc-${s.id})`}
                  style={{
                    filter: isHovered ? 'url(#glow-model-meth)' : 'none',
                  }}
                  transition={{ duration: 0.4 }}
                />
              </g>
            );
          })}

          {/* Polar Star */}
          <g>
            <motion.line
              x1={polarStarPoint.x}
              y1={polarStarPoint.y - 75}
              x2={polarStarPoint.x}
              y2={polarStarPoint.y - 12}
              stroke="#CED4DA"
              strokeWidth="0.8"
              strokeDasharray="3 3"
              strokeOpacity="0.4"
              markerEnd="url(#indicator-arrowhead)"
            />
            <motion.circle
              cx={polarStarPoint.x}
              cy={polarStarPoint.y}
              initial={{ r: 4, opacity: 0.4 }}
              animate={polarStarControls}
              fill="#FFF"
            />
            <circle
              cx={polarStarPoint.x}
              cy={polarStarPoint.y}
              r="3"
              fill="#FFFFFF"
              style={{ filter: 'drop-shadow(0 0 10px #FFF)' }}
            />
            <text
              x={polarStarPoint.x}
              y={polarStarPoint.y - 85}
              textAnchor="middle"
              fill="#FFF"
              className={styles.svgLabel}
              style={{
                filter: 'drop-shadow(0 0 10px rgba(45, 212, 191, 0.5))',
              }}
            >
              Polar Star
            </text>
          </g>
        </svg>
      </div>

      {/* RECHTE SEITE: TEXT INFORMATION ALS LISTE */}
      <div
        className={styles.textWrapper}
        onMouseLeave={isDesktop ? handleInteractionLeave : undefined}
      >
        <div className={styles.textList}>
          {[...methodologySegments].reverse().map((segment) => {
            const isHovered = hoveredSegment?.id === segment.id;
            const isInactive = hoveredSegment !== null && !isHovered;
            const isContentActive = activeContentId === segment.id;

            return (
              <motion.div
                key={segment.id}
                className={`${styles.textListItem} ${
                  isInactive ? styles.dimmedItem : ''
                }`}
                onMouseEnter={
                  isDesktop ? () => handleMouseEnter(segment) : undefined
                }
                onClick={
                  !isDesktop ? () => handleSegmentClick(segment) : undefined
                }
              >
                <div className={styles.headerRow}>
                  <div
                    className={styles.indicatorDot}
                    style={{
                      backgroundColor: isInactive ? 'transparent' : segment.hex,
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
                      color: isInactive ? 'rgba(255,255,255,0.4)' : segment.hex,
                    }}
                  >
                    {segment.subtitle}
                  </span>
                </div>

                <motion.h2
                  className={styles.infoTitle}
                  animate={{
                    scale: isHovered ? 1.05 : 1,
                    color: '#F0F4F8',
                  }}
                  style={{ originX: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {segment.title}
                </motion.h2>

                {/* Hier übergeben wir handleExitComplete an AnimatePresence.
                  Das garantiert, dass Framer Motion erst den Einzug beendet, bevor der neue State gesetzt wird.
                */}
                <AnimatePresence
                  mode="wait"
                  initial={false}
                  onExitComplete={handleExitComplete}
                >
                  {isContentActive && (
                    <motion.div
                      key={`content-${segment.id}`}
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
                      <p className={styles.infoDesc}>{segment.description}</p>

                      {segment.listItems && (
                        <div className={styles.detailsList}>
                          {segment.listItems.map((item, idx) => (
                            <div key={idx} className={styles.detailItem}>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ArcSystem;
