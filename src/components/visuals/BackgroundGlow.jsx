import React from 'react';
import styles from './BackgroundGlow.module.scss';

export default function BackgroundGlow({ className = "", variant = "study" }) {

  const variantClass = styles[variant] || styles.study;

  return (
    <div className={`${styles.backgroundGlowLayer} ${variantClass} ${className}`}>
  
      <div className={styles.bgGlow}></div>
      
      {/* Animierte Ambient Orbs (Positionen werden durch die Variante gesteuert) */}
      <div className={`${styles.ambientOrb} ${styles.orb1}`}></div>
      <div className={`${styles.ambientOrb} ${styles.orb2}`}></div>
      <div className={`${styles.ambientOrb} ${styles.orb3}`}></div>
    </div>
  );
}