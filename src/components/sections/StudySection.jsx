import React from 'react';
import StudyCard from '../cards/StudyCard';
import FadeOutSection from '../visuals/FadeoutSection';
import BackgroundGlow from '../visuals/BackgroundGlow';
import styles from './StudySection.module.scss';

import { studiesData } from "../../data/content";

const StudySection = () => {

  const handleStudyClick = (viewName, targetId) => {
    console.log(`Navigiere zu View: ${viewName}, Target ID: ${targetId}`);
  };

  return (
    <FadeOutSection id="studies" className={styles.studyContainer}>
      {/* Das prop className="glow" garantiert die fehlerfreie Zuordnung in der FadeOutSection */}
            
      <BackgroundGlow className="glow" variant='study' />

      <main className={styles.studysSection}>
        <section id="view-overview" className={`${styles.viewSection} ${styles.active}`}>
          
          {/* Header Section */}
          <header className={styles.studysHeader}>
            <p className={styles.studysTitle}>
              The Science we are using
            </p>
          </header>

          {/* 3 Cards Container */}
          <div className={styles.cardsContainer}>
            {studiesData.map((study, index) => (
              <React.Fragment key={study.id}>
                
                <StudyCard data={study} onStudyClick={handleStudyClick} />
                
                {index < studiesData.length - 1 && (
                  <>
                    <div className={styles.cardDivider}></div>
                    <div className={styles.cardDividerMobile}></div>
                  </>
                )}
                
              </React.Fragment>
            ))}
          </div>
          
        </section>
      </main>
    </FadeOutSection>
  );
};

export default StudySection;