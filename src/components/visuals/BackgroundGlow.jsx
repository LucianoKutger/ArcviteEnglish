import React from 'react';
import styles from './BackgroundGlow.module.scss';
import useViewportActivity from '../../hooks/useViewportActivity';

export default function BackgroundGlow({ className = "", variant = "study" }) {

  const variantClass = styles[variant] || styles.study;
  const { targetRef, isActive } = useViewportActivity();
  const animationStateClass = isActive ? '' : styles.animationsPaused;

  return (
    <div
      ref={targetRef}
      className={`${styles.backgroundGlowLayer} ${variantClass} ${animationStateClass} ${className}`}
    >
  
      <div className={styles.bgGlow}></div>
      
      {/* Animierte Ambient Orbs (Positionen werden durch die Variante gesteuert) */}
      <div className={`${styles.ambientOrb} ${styles.orb1}`}></div>
      <div className={`${styles.ambientOrb} ${styles.orb2}`}></div>
      <div className={`${styles.ambientOrb} ${styles.orb3}`}></div>
    </div>
  );
}
