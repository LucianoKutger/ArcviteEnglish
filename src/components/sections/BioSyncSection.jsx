import React, { useState } from 'react';
import FadeOutSection from '../visuals/FadeoutSection';
import HeroFlowLines from '../visuals/HeroFlowLines';
import ExpandableCard from '../cards/ExpandableCards';
import { syncCardsData } from '../../data/content'; // Pfad angepasst: Zwei Ebenen hoch zu src/data
import styles from './BioSyncSection.module.scss';

const BioSyncSection = () => {
  
  const [activeCard, setActiveCard] = useState(null);

  return (
    <FadeOutSection id="biosync" className={styles.syncSection} delayPercentage={0.6}>
      
      <HeroFlowLines direction='left'/>
          
        <div className={styles.syncContainer}>
          <div className={styles.syncHeader}>
            <h2 className={styles.syncTitle}>
              Biometric Sync
            </h2>
            <p className={styles.syncSubtitle}>
              Seamless Hardware & Laboratory Interfaces
            </p>
          </div>

          <div className={styles.syncGrid}>
            {syncCardsData.map((card) => (
              <ExpandableCard
                key={card.id}
                title={card.title}
                category={card.category}
                focusTitle={card.focusTitle}
                focusDesc={card.focusDesc}
                imageLabel={card.imageLabel}
                details={card.details}
                className={card.className} 
                image={card.image}
                isOpen={activeCard === card.id}
                onToggle={() => setActiveCard(activeCard === card.id ? null : card.id)}
                opacity={card.opacity}
                wide={card.wide}
              />
            ))}
          </div>
        </div>

    </FadeOutSection>
  );
};

export default BioSyncSection;
