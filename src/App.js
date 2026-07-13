import { ReactLenis } from 'lenis/react';
import { Routes, Route } from 'react-router-dom';


import Navbar from './components/ui/Navbar'; 
import Home from './Home';                   
import LegalNotice from './components/LegalNotice';
import PrivacySettings from './components/PrivacySettings'
import StudyDetails from './components/StudyDetails';

 
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

        <Navbar />
        <div className={styles.contentArea}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/impressum" element={<LegalNotice />} />
            <Route path="/datenschutz" element={<PrivacySettings />} />
            <Route path="/studies" element={<StudyDetails />}/>
          </Routes>
        </div>

      </div>
    </ReactLenis>
  );
};

export default App;
