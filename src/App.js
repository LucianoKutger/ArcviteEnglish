import { ReactLenis } from 'lenis/react';
import { Routes, Route } from 'react-router-dom';


import Navbar from './components/ui/Navbar'; 
import Home from './Home';                   
import LegalNotice from './components/LegalNotice';
import PrivacySettings from './components/PrivacySettings'

 
//styles
import styles from './App.module.scss';

const App = () => {

  return (
    <ReactLenis root options={{ 
      lerp: 0.07,          
      duration: 1.2,        
      smoothWheel: true,    
      wheelMultiplier: 1.0  
    }}>
      <div className={styles.landingPageWrapper}>
        
        <div className={styles.lpNoiseContainer}>
          <div className={styles.lpNoiseOverlay} />
        </div>

        <Navbar />
        <div className={styles.contentArea}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/impressum" element={<LegalNotice />} />
            <Route path="/datenschutz" element={<PrivacySettings />} />
          </Routes>
        </div>

      </div>
    </ReactLenis>
  );
};

export default App;