import { ReactLenis } from 'lenis/react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { lazy, Suspense, useLayoutEffect } from 'react';
import Navbar from './components/ui/Navbar';
import Home from './Home';

//styles
import styles from './App.module.scss';

const LegalNotice = lazy(() => import('./components/LegalNotice'));
const PrivacySettings = lazy(() => import('./components/PrivacySettings'));
const StudyDetails = lazy(() => import('./components/StudyDetails'));
const NotFound = lazy(() => import('./components/NotFound'));

const App = () => {
  const shouldReduceMotion = useReducedMotion();
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const appContent = (
    <div
      className={styles.landingPageWrapper}
      data-smooth-scroll={shouldReduceMotion ? 'disabled' : 'enabled'}
    >
      <Navbar />

      <div className={styles.contentArea}>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/impressum" element={<LegalNotice />} />
            <Route path="/datenschutz" element={<PrivacySettings />} />
            <Route path="/studies" element={<StudyDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );

  if (shouldReduceMotion) {
    return appContent;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.07,
        smoothWheel: true,
        wheelMultiplier: 1.0,
      }}
    >
      {appContent}
    </ReactLenis>
  );
};

export default App;
