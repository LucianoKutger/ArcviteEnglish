import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MethodologySystem.module.scss';
import { methodologySegments } from '../../data/content';

const ArcSystem = () => {
  // 1. Ersetzt activeSegment -> Steuert das INSTANTE Aufleuchten der Bögen/Titel
  const [hoveredSegment, setHoveredSegment] = useState(null);
  
  // 2. Neu -> Steuert exklusiv das nacheinander geschaltete Ausfahren der Infotexte
  const [activeContentId, setActiveContentId] = useState(null);

  // 3. Neu -> Speichert die aktuelle Hover-ID für die Exit-Synchronisation
  const latestHoveredIdRef = useRef(null);

  // 4. Fix -> Wieder hinzugefügt für das Hover-Verhalten des "YOU"-Zentrums!
  const [isCenterHovered, setIsCenterHovered] = useState(false);

  // --- GEOMETRIE LOGIK ---
  const centerX = 120; 
  const centerY = 580; 

  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return { x: cx + (r * Math.cos(angleInRadians)), y: cy + (r * Math.sin(angleInRadians)) };
  };

  const getPointyArcPath = (r, startAngle, endAngle, thickness) => {
    const pStart = polarToCartesian(centerX, centerY, r, startAngle);
    const pEnd = polarToCartesian(centerX, centerY, r, endAngle);
    const rOut = r + thickness / 2;
    const rIn = r - thickness / 2;
    return ["M", pStart.x, pStart.y, "A", rOut, rOut, 0, 0, 1, pEnd.x, pEnd.y, "A", rIn, rIn, 0, 0, 0, pStart.x, pStart.y, "Z"].join(" ");
  };

  const arrowStart = polarToCartesian(centerX, centerY, 580, 45);
  const arrowEnd = polarToCartesian(centerX, centerY, 15, 45);
  const polarStarPoint = polarToCartesian(centerX, centerY, 540, 45);

  // --- ANIMATION CHAINING LOGIK ---
  const handleMouseEnter = (segment) => {
    latestHoveredIdRef.current = segment.id;
    setHoveredSegment(segment);

    if (activeContentId === null) {
      // Wenn nichts offen ist, sofort ausfahren
      setActiveContentId(segment.id);
    } else if (activeContentId !== segment.id) {
      // Wenn ein anderer Text offen ist, schließe ihn erst (setze auf null)
      // Der neue Text wartet, bis handleExitComplete feuert
      setActiveContentId(null);
    }
  };

  const handleMouseLeave = () => {
    latestHoveredIdRef.current = null;
    setHoveredSegment(null);
    setActiveContentId(null);
  };

  const handleExitComplete = () => {
    // Diese Funktion wird ERST aufgerufen, wenn der alte Text vollständig unsichtbar eingezogen ist
    if (latestHoveredIdRef.current !== null) {
      setActiveContentId(latestHoveredIdRef.current);
    }
  };

  return (
    <div className={styles.container}>
      {/* LINKSEITE: DAS SVG MODELL */}
      <div className={styles.visualWrapper}>
        <svg viewBox="0 0 700 700" className={styles.svgGraph}>
          <defs>
            {methodologySegments.map(s => (
              <linearGradient key={`grad-arc-${s.id}`} id={`grad-arc-${s.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: s.hex}} />
                <stop offset="50%" style={{stopColor: s.hex, filter: 'brightness(1.4)'}} />
                <stop offset="100%" style={{stopColor: s.hex}} />
              </linearGradient>
            ))}
            <linearGradient id="flow-energy-white" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <marker id="arrow-to-center-bright" markerWidth="20" markerHeight="12" refX="18" refY="6" orient="auto"><polygon points="0 0, 18 6, 0 12" fill="white" /></marker>
            <marker id="indicator-arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#CED4DA" fillOpacity="0.4" /></marker>
            <filter id="glow-model-meth"><feGaussianBlur stdDeviation="2.5" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
          </defs>

          {/* Impact Flow Line */}
          <g>
            <line x1={arrowStart.x} y1={arrowStart.y} x2={arrowEnd.x} y2={arrowEnd.y} stroke="white" strokeWidth="1.3" strokeOpacity="0.8" markerEnd="url(#arrow-to-center-bright)" />
            <motion.line 
                x1={arrowStart.x} y1={arrowStart.y} x2={arrowEnd.x} y2={arrowEnd.y} 
                stroke="url(#flow-energy-white)" strokeLinecap="round" 
                initial={{ pathLength: 0.15, pathOffset: -0.15, opacity: 0 }} 
                animate={{ 
                    pathOffset: [-0.15, 1],
                    opacity: [0.5, 1, 0.5], 
                    strokeWidth: [2, 6, 2] 
                }} 
                transition={{ 
                    pathOffset: { duration: 4, repeat: Infinity, ease: "linear" },
                    opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    strokeWidth: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }} 
                style={{ filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.9))' }} 
            />
            <text x={polarToCartesian(centerX, centerY, 600, 45).x + 12} y={polarToCartesian(centerX, centerY, 600, 45).y - 5} fill="white" fillOpacity="0.75" fontSize="10" letterSpacing="0.5em" className="uppercase italic font-extralight">Impact Flow</text>
          </g>

          {/* Center Point "YOU" */}
          <g className="cursor-pointer" onMouseEnter={() => setIsCenterHovered(true)} onMouseLeave={() => setIsCenterHovered(false)}>
            <motion.circle cx={centerX} cy={centerY} animate={{ r: isCenterHovered ? 20 : 10, opacity: isCenterHovered ? 0.25 : 0.08 }} fill="white" />
            <motion.circle cx={centerX} cy={centerY} animate={{ r: isCenterHovered ? 7 : 4, fill: isCenterHovered ? "#fff" : "rgba(255, 255, 255,0.7)" }} fill="white" />
            <motion.line x1={centerX} y1={centerY + 55} x2={centerX} y2={centerY + 12} stroke="#CED4DA" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.4" markerEnd="url(#indicator-arrowhead)" />
            <text x={centerX} y={centerY + 75} textAnchor="middle" fill="#FFFF" className="text-[10px] uppercase tracking-[0.4em] font-light italic" style={{ filter: 'drop-shadow(0 0 10px rgba(229, 217, 182, 0.3))' }}>YOU</text>
          </g>

          {/* The Arcs (Stripes) */}
          {methodologySegments.map((s) => {
            const isHovered = hoveredSegment?.id === s.id;
            const isInactive = hoveredSegment !== null && !isHovered;
            const r = isHovered ? s.radius + 12 : s.radius; 
            const t = isHovered ? s.thickness * 1.6 : s.thickness; 
            
            return (
                <g key={s.id} className="cursor-pointer group" onMouseEnter={() => handleMouseEnter(s)} onMouseLeave={handleMouseLeave}>
                    <path d={getPointyArcPath(s.radius, -5, 100, s.thickness + 20)} fill="transparent" className="pointer-events-auto" />
                    <motion.path 
                        animate={{ d: getPointyArcPath(r, 10, 80, t), fillOpacity: isInactive ? 0.05 : 1 }} 
                        fill={`url(#grad-arc-${s.id})`} 
                        style={{ filter: isHovered ? 'url(#glow-model-meth)' : 'none' }} 
                        transition={{ duration: 0.4 }} 
                    />
                </g>
            );
          })}

          {/* Polar Star */}
          <g>
            <motion.line x1={polarStarPoint.x} y1={polarStarPoint.y - 75} x2={polarStarPoint.x} y2={polarStarPoint.y - 12} stroke="#CED4DA" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.4" markerEnd="url(#indicator-arrowhead)" />
            <motion.circle cx={polarStarPoint.x} cy={polarStarPoint.y} initial={{ r: 4, opacity: 0.4 }} animate={{ r: 14, opacity: 0 }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }} fill="#FFF" />
            <circle cx={polarStarPoint.x} cy={polarStarPoint.y} r="3" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 0 10px #FFF)' }} />
            <text x={polarStarPoint.x} y={polarStarPoint.y - 85} textAnchor="middle" fill="#FFF" className="text-[10px] uppercase tracking-[0.4em] font-light italic" style={{ filter: 'drop-shadow(0 0 10px rgba(45, 212, 191, 0.5))' }}>Polar Star</text>
          </g>
        </svg>
      </div>

      {/* RECHTE SEITE: TEXT INFORMATION ALS LISTE */}
      <div className={styles.textWrapper}>
        <div className={styles.textList}>
          {[...methodologySegments].reverse().map((segment) => {
            const isHovered = hoveredSegment?.id === segment.id;
            const isInactive = hoveredSegment !== null && !isHovered;
            const isContentActive = activeContentId === segment.id;

            return (
              <motion.div 
                key={segment.id}
                className={`${styles.textListItem} ${isInactive ? styles.dimmedItem : ''}`}
                onMouseEnter={() => handleMouseEnter(segment)}
                onMouseLeave={handleMouseLeave}
              >
                <div className={styles.headerRow}>
                  <div 
                    className={styles.indicatorDot} 
                    style={{ 
                      backgroundColor: isInactive ? 'transparent' : segment.hex,
                      borderColor: isInactive ? 'rgba(255,255,255,0.2)' : 'transparent' ,
                      boxShadow: isInactive ? 'none' : `0 0 15px ${segment.hex}` 
                    }} 
                  />
                  <span 
                    className={styles.subtitle} 
                    style={{ color: isInactive ? 'rgba(255,255,255,0.4)' : segment.hex}}
                  >
                    {segment.subtitle}
                  </span>
                </div>
                
                <motion.h2 
                  className={styles.infoTitle}
                  animate={{ 
                    scale: isHovered ? 1.05 : 1, 
                    color: '#F0F4F8'
                  }}
                  style={{ originX: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {segment.title}
                </motion.h2>
                
                {/* Hier übergeben wir handleExitComplete an AnimatePresence.
                  Das garantiert, dass Framer Motion erst den Einzug beendet, bevor der neue State gesetzt wird.
                */}
                <AnimatePresence onExitComplete={handleExitComplete}>
                  {isContentActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className={styles.expandedContent}
                    >
                      <p className={styles.infoDesc}>{segment.description}</p>
                      
                      {segment.listItems && (
                        <div className={styles.detailsList}>
                          {segment.listItems.map((item, idx) => (
                            <div key={idx} className={styles.detailItem}>
                              <div className={styles.detailHeader}>
                                <div className={styles.detailDot} style={{ backgroundColor: segment.hex }} />
                                <span className={styles.detailLabel} style={{ color: segment.hex }}>{item.label}</span>
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