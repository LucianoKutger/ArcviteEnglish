import React from 'react';
import styles from './StudyCard.module.scss';

const StudyCard = ({ data, onStudyClick }) => {
  return (
    <div className={styles.studyCard}>
      <div className={styles.cardContentGrow}>
        
        {/* Top Bar */}
        <div className={styles.cardTopBar}>
          <div className={styles.cardLine}></div>
          <span className={styles.cardTag}>{data.tag}</span>
          <div className={styles.cardDot}></div>
          <span className={styles.cardBrand}>Arcvite</span>
        </div>

        {/* Title */}
        <h2 className={styles.cardHeading}>
          {data.titlePre} <br />
          <span className={styles.textHighlight}>{data.titleHighlight}</span> <br/>
          {data.titlePost}
        </h2>

        {/* Content */}
        <p className={styles.cardDesc}>
          {data.description}
        </p>

        <blockquote className={styles.cardQuote}>
          "{data.quote}"
        </blockquote>

        {/* Optionale KPI Sektion */}
        {data.kpis && (
          <div className={styles.kpiSection}>
            <div className={styles.kpiGrid}>
              {data.kpis.map((kpi) => (
                <div key={kpi.id} className={styles.kpiBox}>
                  <div className={styles.kpiValue}>{kpi.value}</div>
                  <div className={styles.kpiLabel}>
                    {kpi.labelLine1}<br />{kpi.labelLine2}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Button Footer */}
      <div className={styles.cardFooter}>
        <button 
          onClick={() => onStudyClick('details', data.id)} 
          className={styles.btnGlow}
        >
            <span className={styles.btnContent}>
                VIEW STUDIES
            </span>
        </button>
      </div>
    </div>
  );
};

export default StudyCard;