import { ReactLenis } from 'lenis/react';
import { Routes, Route } from 'react-router-dom';

import { lazy, Suspense } from 'react';
import Navbar from './components/ui/Navbar';
import Home from './Home';

//styles
import styles from './App.module.scss';

const LegalNotice = lazy(() => import('./components/LegalNotice'));
const PrivacySettings = lazy(() => import('./components/PrivacySettings'));
const StudyDetails = lazy(() => import('./components/StudyDetails'));

const App = () => {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.07,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1.0,
      }}
    >
      <div className={styles.landingPageWrapper}>
        <Navbar />
        <div className={styles.contentArea}>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/impressum" element={<LegalNotice />} />
              <Route path="/datenschutz" element={<PrivacySettings />} />
              <Route path="/studies" element={<StudyDetails />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </ReactLenis>
  );
};

export default App;
