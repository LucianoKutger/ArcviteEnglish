import styles from './SolutionCard.module.scss';
import { AiOutlineExpandAlt } from "react-icons/ai";

const SolutionCard = ({ item, onOpen, imgSrc }) => {
    return (
      <div 
          layoutId={`card-${item.id}`} 
          onClick={() => onOpen(item)}
          className={styles.card}
      >
        
          <div className={styles.imageContainer}>
               <div className={styles.gridPattern} />
               <div className={styles.imageWrapper}>
                   <img src={imgSrc} alt="" ></img>
               </div>
               <div className={styles.gradientOverlay} />
          </div>
          <div className={styles.content}>
            
               <div className={styles.topBar}>
                   <div className={styles.iconGroup}>
                  
                   </div>
                   
                   <div className={styles.idWrapper}>
                       <AiOutlineExpandAlt size="1.5rem" color="#2DD4BF"/>
                      
                   </div>
               </div>
                
               <h3 className={styles.title}>{item.title}</h3>
  
               <div className={styles.bodyWrapper}>
                    <div className={styles.sectionHeader}>
                         <div className={styles.problemDot}></div>
                         <p className={styles.problemLabel}>Problem</p>
                    </div>
                    <p className={styles.problemText}>"{item.problem}"</p>
                    
                    <div className={styles.sectionHeader}>
                         <div className={styles.solutionDot}></div>
                         <p className={styles.solutionLabel}>Solution</p>
                    </div>
                    <p className={styles.solutionText}>{item.solution}</p>
               </div>
          </div>
      </div>
    );
  };

export default SolutionCard;