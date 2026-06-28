import React, { useState } from 'react';
import { Send } from 'lucide-react';
import FadeOutSection from '../visuals/FadeoutSection';
import FormInput from '../ui/FormInput';
import { goalOptions } from '../../data/content';
import styles from './AuditSection.module.scss';

const AuditSection = () => {
  const [selectedGoals, setSelectedGoals] = useState([]);

  const toggleGoal = (value) => {
    if (selectedGoals.includes(value)) {
      setSelectedGoals(selectedGoals.filter(g => g !== value));
    } else {
      setSelectedGoals([...selectedGoals, value]);
    }
  };

  return (
    <FadeOutSection id="audit" className={styles.footer}>
       <div className={styles.container}>
          <div className={styles.auditCard}>
            <div className={styles.header}>
              <h2 className={styles.title}>
                 <span className={styles.titleBold}>Audit Application</span>
              </h2>
            </div>

            <form className={styles.form}>
              <div className={styles.inputGrid}>
                <FormInput label="First Name *" placeholder="John" />
                <FormInput label="Last Name *" placeholder="Doe" />
              </div>
              
              <div className={styles.inputGrid}>
                <FormInput label="E-Mail*" type="email" placeholder="john@company.com" />
                <FormInput label="Phone Number*" type="tel" placeholder="+49 123 45678" />
              </div>

              <div className={styles.goalsSection}>
                <label className={styles.goalsLabel}>Goals* (multiple selection possible)</label>
                <div className={styles.goalsContainer}>
                  {goalOptions.map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => toggleGoal(goal.value)}
                      // Updated class structure mapping directly to nested states
                      className={`${styles.goalButton} ${selectedGoals.includes(goal.value) ? styles.active : styles.inactive}`}
                    >
                      {goal.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className={styles.submitButton}>
                <span className={styles.submitButtonContent}>
                  Check availability
                  <Send className={styles.sendIcon} />
                </span>
              </button>

              <p className={styles.disclaimer}>
                * To guarantee the depth and excellence of our service, we only accept a limited number of new clients per quarter. We will get back to you within 24 hours.
              </p>
            </form>
          </div>
        </div>
    </FadeOutSection>
  );
};

export default AuditSection;