import FadeOutSection from '../visuals/FadeoutSection';
import AuditApplicationForm from './audit/AuditApplicationForm';
import styles from './AuditSection.module.scss';

const AuditSection = () => (
  <FadeOutSection id="audit" className={styles.footer}>
    <div className={styles.container}>
      <div className={styles.auditCard}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.titleBold}>Audit Application</span>
          </h2>
        </div>

        <AuditApplicationForm />
      </div>
    </div>
  </FadeOutSection>
);

export default AuditSection;
