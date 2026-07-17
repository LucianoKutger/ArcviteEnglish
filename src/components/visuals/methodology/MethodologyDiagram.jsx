import { useState } from 'react';
import { motion } from 'framer-motion';

import { methodologySegments } from '../../../data/content';
import {
  getPointyArcPath,
  polarToCartesian,
} from '../../../utils/methodologyGeometry';
import styles from '../MethodologySystem.module.scss';

const CENTER_X = 120;
const CENTER_Y = 580;

const MethodologyDiagram = ({
  handleInteractionLeave,
  handleSegmentClick,
  handleSegmentEnter,
  hoveredSegment,
  impactFlowControls,
  isDesktop,
  polarStarControls,
}) => {
  const [isCenterHovered, setIsCenterHovered] = useState(false);
  const arrowStart = polarToCartesian(CENTER_X, CENTER_Y, 580, 45);
  const arrowEnd = polarToCartesian(CENTER_X, CENTER_Y, 15, 45);
  const polarStarPoint = polarToCartesian(CENTER_X, CENTER_Y, 540, 45);

  return (
    <div
      className={styles.visualWrapper}
      onMouseLeave={isDesktop ? handleInteractionLeave : undefined}
    >
      <svg
        viewBox="0 0 700 700"
        className={styles.svgGraph}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {methodologySegments.map((segment) => (
            <linearGradient
              key={`grad-arc-${segment.id}`}
              id={`grad-arc-${segment.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" style={{ stopColor: segment.hex }} />
              <stop
                offset="50%"
                style={{ stopColor: segment.hex, filter: 'brightness(1.4)' }}
              />
              <stop offset="100%" style={{ stopColor: segment.hex }} />
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
            x={polarToCartesian(CENTER_X, CENTER_Y, 600, 45).x + 12}
            y={polarToCartesian(CENTER_X, CENTER_Y, 600, 45).y - 5}
            fill="white"
            fillOpacity="0.75"
            fontSize="10"
            letterSpacing="0.5em"
            className={styles.impactFlowLabel}
          >
            Impact Flow
          </text>
        </g>

        <g
          className={styles.interactiveGroup}
          onMouseEnter={() => setIsCenterHovered(true)}
          onMouseLeave={() => setIsCenterHovered(false)}
        >
          <motion.circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={10}
            initial={false}
            animate={{
              r: isCenterHovered ? 20 : 10,
              opacity: isCenterHovered ? 0.25 : 0.08,
            }}
            fill="white"
          />
          <motion.circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={4}
            initial={false}
            animate={{
              r: isCenterHovered ? 7 : 4,
              fill: isCenterHovered ? '#fff' : 'rgba(255, 255, 255,0.7)',
            }}
            fill="white"
          />
          <motion.line
            x1={CENTER_X}
            y1={CENTER_Y + 55}
            x2={CENTER_X}
            y2={CENTER_Y + 12}
            stroke="#CED4DA"
            strokeWidth="0.8"
            strokeDasharray="3 3"
            strokeOpacity="0.4"
            markerEnd="url(#indicator-arrowhead)"
          />
          <text
            x={CENTER_X}
            y={CENTER_Y + 75}
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

        {methodologySegments.map((segment) => {
          const isHovered = hoveredSegment?.id === segment.id;
          const isInactive = hoveredSegment !== null && !isHovered;
          const radius = isHovered ? segment.radius + 12 : segment.radius;
          const thickness = isHovered
            ? segment.thickness * 1.6
            : segment.thickness;
          const baseArcPath = getPointyArcPath(
            CENTER_X,
            CENTER_Y,
            segment.radius,
            10,
            80,
            segment.thickness
          );
          const animatedArcPath = getPointyArcPath(
            CENTER_X,
            CENTER_Y,
            radius,
            10,
            80,
            thickness
          );

          return (
            <g
              key={segment.id}
              className={styles.interactiveGroup}
              onMouseEnter={
                isDesktop ? () => handleSegmentEnter(segment) : undefined
              }
              onClick={
                !isDesktop ? () => handleSegmentClick(segment) : undefined
              }
            >
              <path
                d={getPointyArcPath(
                  CENTER_X,
                  CENTER_Y,
                  segment.radius,
                  -5,
                  100,
                  segment.thickness + 20
                )}
                fill="transparent"
                className={styles.interactiveHitArea}
              />
              <motion.path
                d={baseArcPath}
                initial={false}
                animate={{
                  d: animatedArcPath,
                  fillOpacity: isInactive ? 0.05 : 1,
                }}
                fill={`url(#grad-arc-${segment.id})`}
                style={{
                  filter: isHovered ? 'url(#glow-model-meth)' : 'none',
                }}
                transition={{ duration: 0.4 }}
              />
            </g>
          );
        })}

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
            r={4}
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
  );
};

export default MethodologyDiagram;
