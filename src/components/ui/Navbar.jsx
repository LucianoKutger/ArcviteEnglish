import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';


import ArcviteLogo from './ArcviteLogo'; 
import { navItems } from '../../data/content'; 


import navBarStyles from './NavBar.module.scss'; 

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const scrollToSection = (id) => {
    setMobileMenuOpen(false); 


    if (location.pathname !== '/') {
      navigate('/'); 
      
    
      setTimeout(() => {
        if (id === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 100);
      return; 
    }

   
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav id="nav" className={`${navBarStyles.lpNavbar} ${isScrolled ? navBarStyles.scrolled : ''}`}>
      <div className={navBarStyles.lpNavInner}>
        
  
        <div className={navBarStyles.lpLogoWrap} onClick={() => scrollToSection('home')}>
          <ArcviteLogo />
        </div>
        
      
        <div className={navBarStyles.lpNavLinks}>
          {navItems.map((item) => (
            <button 
              key={item.label} 
              onClick={() => scrollToSection(item.targetId)}
              className={navBarStyles.lpNavBtn}
            >
              {item.label}
            </button>
          ))}
        </div>
        
   
        <div className={navBarStyles.lpNavActions}>
          <button 
              onClick={() => scrollToSection('audit')}
              className={navBarStyles.lpHeaderAuditBtn}
          >
            <span className={navBarStyles.auditContent}>
              Secure Audit <ChevronRight className={navBarStyles.auditIcon} />
            </span>
          </button>
        </div>
        
       
        <button 
          className={navBarStyles.lpMobileMenuToggle} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;