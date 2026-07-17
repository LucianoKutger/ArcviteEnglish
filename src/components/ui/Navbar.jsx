import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import ArcviteLogo from './ArcviteLogo';
import { navItems } from '../../data/content';

import navBarStyles from './NavBar.module.scss';

const getInitialScrollState = () =>
  typeof window !== 'undefined' && window.scrollY > 20;

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(getInitialScrollState);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuButtonRef = useRef(null);
  const firstMobileItemRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const lenis = useLenis();
  const scrollBehavior = shouldReduceMotion ? 'auto' : 'smooth';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      setMobileMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    firstMobileItemRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/', {
        state: {
          scrollTarget: id,
        },
      });

      return;
    }

    const target = id === 'home' ? 0 : document.getElementById(id);

    if (target === null) {
      return;
    }

    if (lenis && !shouldReduceMotion) {
      lenis.scrollTo(target);
      return;
    }

    if (id === 'home') {
      window.scrollTo({
        top: 0,
        behavior: scrollBehavior,
      });

      return;
    }

    target.scrollIntoView({
      behavior: scrollBehavior,
    });
  };

  return (
    <nav
      id="nav"
      data-scrolled={isScrolled}
      className={`${navBarStyles.lpNavbar} ${isScrolled ? navBarStyles.scrolled : ''}`}
    >
      <div className={navBarStyles.lpNavInner}>
        <button
          type="button"
          aria-label="Go to home"
          onClick={() => scrollToSection('home')}
          className={navBarStyles.lpLogoWrap}
        >
          <ArcviteLogo />
        </button>

        <div className={navBarStyles.lpNavLinks}>
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.targetId)}
              className={navBarStyles.lpNavBtn}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={navBarStyles.lpNavActions}>
          <button
            type="button"
            onClick={() => scrollToSection('audit')}
            className={navBarStyles.lpHeaderAuditBtn}
          >
            <span className={navBarStyles.auditContent}>
              Secure Audit <ChevronRight className={navBarStyles.auditIcon} />
            </span>
          </button>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          aria-label={
            mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
          }
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          className={navBarStyles.lpMobileMenuToggle}
          onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      <div
        id="mobile-navigation"
        hidden={!mobileMenuOpen}
        className={navBarStyles.lpMobileMenu}
      >
        {navItems.map((item, index) => (
          <button
            type="button"
            key={item.label}
            onClick={() => scrollToSection(item.targetId)}
            className={navBarStyles.lpMobileNavBtn}
            ref={index === 0 ? firstMobileItemRef : null}
          >
            {item.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => scrollToSection('audit')}
          className={navBarStyles.lpMobileAuditBtn}
        >
          Secure Audit
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
