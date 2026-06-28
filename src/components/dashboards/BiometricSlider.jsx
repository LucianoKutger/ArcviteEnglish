import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import styles from "./BiometricSliderStyle.module.scss"

const BiometricSlider = ({ label, segments, before, normal, optimum, unit, inverted, delay, description }) => {
    const displaySegments = segments || [
    { width: '18%', type: 'suboptimal', topLabel: 'Suboptimal' }, // 'type' statt 'color'
    { width: '22%', type: 'basis', topLabel: 'Basis' },
    { width: '20%', type: 'optimum', topLabel: 'Optimum', isOptimum: true },
    { width: '22%', type: 'basis', topLabel: 'Basis' },
    { width: '18%', type: 'suboptimal', topLabel: 'Suboptimal' },
];

    return (
        <div className={styles.biometricContainer}>
            <div className={styles.glowOverlay} />
            <div className={styles.headerRow}>
                <span className={styles.labelText}>{label}</span>
                {description && (
                    <div className={styles.infoWrapper}>
                        <Info className={styles.infoIcon} />
                        <div className={styles.tooltipBox}>
                            <div className={styles.tooltipContent}>
                                <span className={styles.tooltipTag}>Performance Impact</span>
                                {description}
                            </div>
                            <div className={styles.tooltipArrow}></div>
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.topLabelsRow}>
                 {displaySegments.map((seg, idx) => {
                     const segmentType = seg.type || (seg.topLabel === 'Suboptimal' ? 'suboptimal' : 'basis');

                 return (
                    <div 
                    key={idx} 
                    style={{ width: seg.width }} className={styles.labelCol}>
                       <span className={`
                            ${styles.topLabel} 
                            ${seg.isOptimum ? styles.isOptimum : ''} 
                            ${segmentType === 'suboptimal' ? styles.isSuboptimal : ''}
                        `}>
                            {seg.topLabel}
                        </span>
                    </div>
                 )})}
            </div>
            
           
            <motion.div 
                key={label}
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 1.5, delay: delay || 0, ease: [0.22, 1, 0.36, 1] }}
                className={styles.trackBar}
            > 
                {displaySegments.map((seg, idx) => {
                    const segmentType = seg.type || (seg.topLabel === 'Suboptimal' ? 'suboptimal' : 'basis');

                    return (
                        <div 
                            key={idx} 
                            style={{ width: seg.width }} 
                            className={`${styles.trackSegment} ${styles[segmentType] || styles.basis}`}
                        >
                            {seg.isOptimum && ( <div className={styles.optimumPulse} /> )}
                        </div>
                )})}
                <div className={styles.trackInnerShadow} />
            </motion.div>

            <div className={styles.bottomLabelsRow}>
                {displaySegments.map((seg, idx) => (
                    <div key={idx} style={{ width: seg.width }} className={styles.labelCol}>
                        {seg.label ? (
                            <>
                                <span className={`${styles.bottomVal} ${seg.isOptimum ? styles.textOptimum : ''}`}>{seg.label}</span>
                                {unit && <span className={styles.unitText}>{unit}</span>}
                            </>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BiometricSlider;