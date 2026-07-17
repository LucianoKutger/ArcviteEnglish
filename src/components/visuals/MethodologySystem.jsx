import styles from './MethodologySystem.module.scss';
import MethodologyContentList from './methodology/MethodologyContentList';
import MethodologyDiagram from './methodology/MethodologyDiagram';
import useMethodologySystem from './methodology/useMethodologySystem';

const MethodologySystem = ({ waitForCloseBeforeOpen = false }) => {
  const methodology = useMethodologySystem(waitForCloseBeforeOpen);

  return (
    <div
      ref={methodology.targetRef}
      className={styles.container}
      data-testid="methodology-system"
    >
      <MethodologyDiagram {...methodology} />
      <MethodologyContentList
        {...methodology}
        waitForCloseBeforeOpen={waitForCloseBeforeOpen}
      />
    </div>
  );
};

export default MethodologySystem;
