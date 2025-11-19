import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import circle from '../components/Menu Circle.png';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [navColor, setNavColor] = useState('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isNewsPage = location.pathname === '/news';

  useEffect(() => {
    console.log('📍 NAVBAR MOUNTED - Path:', location.pathname);
    
    if (location.pathname !== '/') {
      console.log('📍 Bukan Home page, set dark');
      setNavColor('dark');
      return;
    }

    const handleScroll = () => {
      const newsSection = document.getElementById('news-home');
      const aboutSection = document.getElementById('about');
      
      console.log('🔄 SCROLLING - Looking for sections...');
      console.log('📄 News section found:', !!newsSection);
      console.log('📄 About section found:', !!aboutSection);
      
      if (newsSection && aboutSection) {
        const newsRect = newsSection.getBoundingClientRect();
        const aboutRect = aboutSection.getBoundingClientRect();
        
        console.log('📊 News section position - top:', Math.round(newsRect.top), 'bottom:', Math.round(newsRect.bottom));
        console.log('📊 About section position - top:', Math.round(aboutRect.top), 'bottom:', Math.round(aboutRect.bottom));
        
        // Simple logic: mana yang lebih dekat ke tengah viewport?
        const viewportCenter = window.innerHeight / 2;
        const newsDistance = Math.abs(newsRect.top + newsRect.height/2 - viewportCenter);
        const aboutDistance = Math.abs(aboutRect.top + aboutRect.height/2 - viewportCenter);
        
        console.log('🎯 Distance to center - News:', Math.round(newsDistance), 'About:', Math.round(aboutDistance));
        
        if (aboutDistance < newsDistance && aboutRect.top <= viewportCenter) {
          console.log('🎯 CLOSEST: About section - Setting DARK');
          setNavColor('dark');
        } else if (newsDistance < aboutDistance && newsRect.top <= viewportCenter) {
          console.log('🎯 CLOSEST: News section - Setting LIGHT');
          setNavColor('light');
        } else {
          console.log('🎯 CLOSEST: Neither - Setting DARK');
          setNavColor('dark');
        }
      } else {
        console.log('❌ Sections not found!');
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check setelah DOM fully loaded
    setTimeout(() => {
      console.log('🚀 INITIAL CHECK after timeout');
      handleScroll();
    }, 100);

    return () => {
      console.log('🧹 CLEANUP - Removing scroll listener');
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  // Cleanup body scroll lock ketika component unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleAboutClick = (e) => {
    e.preventDefault();
    console.log('🖱️ ABOUT clicked');
    closeMenu();
    
    if (location.pathname === '/') {
      const element = document.getElementById('about');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => setNavColor('dark'), 400);
      }
    } else {
      sessionStorage.setItem('scrollToAbout', 'true');
      navigate('/');
    }
  };

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      console.log('🖱️ HOME clicked');
      closeMenu();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setNavColor('dark'), 400);
    }
  };

  const handleIsbnClick = (e) => {
    e.preventDefault();
    console.log('🖱️ ISBN clicked');
    closeMenu();
    
    if (location.pathname === '/') {
      const element = document.getElementById('isbn');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => setNavColor('dark'), 400);
      }
    } else {
      sessionStorage.setItem('scrollToIsbn', 'true');
      navigate('/');
    }
  };

  const handleExperienceClick = () => {
    closeMenu();
  };

  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      document.body.style.overflow = 'hidden';
    } else {
      closeMenu();
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  const getNavLinkClass = () => {
    if (isNewsPage) return 'nav-link-dark';
    if (navColor === 'light') return 'nav-link-white';
    return '';
  };

  const getNavLogoClass = () => {
    if (isNewsPage) return 'nav-logo-dark';
    if (navColor === 'light') return 'nav-logo-white';
    return '';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className={`nav-logo ${getNavLogoClass()}`}></div>
        
        <div 
          className={`burger-menu ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <img 
            src={circle} 
            alt="Menu" 
            className={`burger-icon ${isMenuOpen ? 'active' : ''}`}
          />
        </div>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${getNavLinkClass()}`}
              onClick={handleHomeClick}
            >
              HOME
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/news" 
              className={`nav-link ${getNavLinkClass()}`}
            >
              EXPERIENCE
            </Link>
          </li>
          <li className="nav-item">
            <a 
              href="#isbn"
              className={`nav-link ${getNavLinkClass()}`}
              onClick={handleIsbnClick}
              style={{ textDecoration: 'none' }}
            >
              ISBN
            </a>
          </li>
          <li className="nav-item">
            <a 
              href="#about"
              className={`nav-link ${getNavLinkClass()}`}
              onClick={handleAboutClick}
              style={{ textDecoration: 'none' }}
            >
              ABOUT
            </a>
          </li>
        </ul>

        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-backdrop" onClick={closeMenu}></div>
          <div className="mobile-menu-content">
            <Link 
              to="/" 
              className="mobile-nav-link"
              onClick={(e) => {
                handleHomeClick(e);
                closeMenu();
              }}
            >
              HOME
            </Link>
            <Link 
              to="/news" 
              className="mobile-nav-link"
              onClick={() => {
                handleExperienceClick();
                closeMenu();
              }}
            >
              EXPERIENCE
            </Link>
            <a 
              href="#isbn"
              className="mobile-nav-link"
              onClick={(e) => {
                handleIsbnClick(e);
                closeMenu();
              }}
              style={{ textDecoration: 'none' }}
            >
              ISBN
            </a>
            <a 
              href="#about"
              className="mobile-nav-link"
              onClick={(e) => {
                handleAboutClick(e);
                closeMenu();
              }}
              style={{ textDecoration: 'none' }}
            >
              ABOUT
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;