import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import './Home.css';
import homeBg from './images/home-bg.png';
import kepsek from '../pages/images/kepsek.png';
import BookSection from '../components/BookSection';

const Home = () => {
  const [prestasiImages, setPrestasiImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManualScroll, setIsManualScroll] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const scrollTimeoutRef = useRef(null);
  
  // State untuk animasi About
  const [aboutInView, setAboutInView] = useState(false);

  // CONFIG: Atur berapa kali looping di sini
  const LOOP_COUNT = 100;

  // Data media sosial dengan CDN URLs - PASTI BERHASIL
  const socialMedia = [
    {
      name: 'YouTube',
      icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg',
      url: 'https://youtube.com/@rahayuasyhari2008?si=sR16A615sx6Cwn6d'
    },
    {
      name: 'Facebook', 
      icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg',
      url: 'https://www.facebook.com/rahayu.asyhari/'
    },
    {
      name: 'Instagram',
      icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg',
      url: 'https://www.instagram.com/rahayuasyhari'
    }
  ];

  // Preload background image dan trigger animasi
  useEffect(() => {
    const img = new Image();
    img.src = homeBg;
    img.onload = () => {
      setBgLoaded(true);
    };
  }, []);

  // SOLUSI: Scroll langsung ke About ketika datang dari navigasi
  useEffect(() => {
    // Cek jika user datang dari navigasi About
    const isFromAboutNavigation = sessionStorage.getItem('scrollToAbout');
    
    if (isFromAboutNavigation) {
      console.log('🎯 Scrolling directly to About section');
      
      // Hapus flag
      sessionStorage.removeItem('scrollToAbout');
      
      // Scroll langsung ke About
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        // Gunakan setTimeout kecil untuk memastikan DOM ready
        setTimeout(() => {
          aboutSection.scrollIntoView(); // Instant scroll
          setAboutInView(true);
        }, 50);
      }
    }
  }, []);

  // SOLUSI: Scroll langsung ke ISBN ketika datang dari navigasi
  useEffect(() => {
    // Cek jika user datang dari navigasi ISBN
    const isFromIsbnNavigation = sessionStorage.getItem('scrollToIsbn');
    
    if (isFromIsbnNavigation) {
      console.log('🎯 Scrolling directly to ISBN section');
      
      // Hapus flag
      sessionStorage.removeItem('scrollToIsbn');
      
      // Scroll langsung ke ISBN
      const isbnSection = document.getElementById('isbn');
      if (isbnSection) {
        // Gunakan setTimeout kecil untuk memastikan DOM ready
        setTimeout(() => {
          isbnSection.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    }
  }, []);

  // Load gambar prestasi dari Firebase
  useEffect(() => {
    const loadPrestasiImages = async () => {
      try {
        const prestasiQuery = query(collection(db, 'prestasi'), orderBy('createdAt', 'desc'));
        const prestasiSnapshot = await getDocs(prestasiQuery);
        const prestasiData = prestasiSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPrestasiImages(prestasiData);
      } catch (error) {
        console.error('Error loading prestasi images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrestasiImages();
  }, []);

  // Handle manual scroll
  useEffect(() => {
    const galleryContainer = document.querySelector('.prestasi-gallery-container');
    
    const handleScrollStart = () => {
      setIsManualScroll(true);
      galleryContainer?.classList.add('manual-scroll');
      galleryContainer?.classList.remove('auto-scroll');
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };

    const handleScrollEnd = () => {
      scrollTimeoutRef.current = setTimeout(() => {
        setIsManualScroll(false);
        galleryContainer?.classList.remove('manual-scroll');
        galleryContainer?.classList.add('auto-scroll');
      }, 3000);
    };

    if (galleryContainer) {
      galleryContainer.addEventListener('touchstart', handleScrollStart);
      galleryContainer.addEventListener('touchend', handleScrollEnd);
      galleryContainer.addEventListener('mousedown', handleScrollStart);
      galleryContainer.addEventListener('mouseup', handleScrollEnd);
      galleryContainer.addEventListener('mouseleave', handleScrollEnd);
      galleryContainer.addEventListener('scroll', handleScrollStart);
    }

    return () => {
      if (galleryContainer) {
        galleryContainer.removeEventListener('touchstart', handleScrollStart);
        galleryContainer.removeEventListener('touchend', handleScrollEnd);
        galleryContainer.removeEventListener('mousedown', handleScrollStart);
        galleryContainer.removeEventListener('mouseup', handleScrollEnd);
        galleryContainer.removeEventListener('mouseleave', handleScrollEnd);
        galleryContainer.removeEventListener('scroll', handleScrollStart);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Animasi About Section dengan scroll event listener sederhana
  useEffect(() => {
    const handleScroll = () => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        const rect = aboutSection.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight * 0.8;
        
        if (isInView && !aboutInView) {
          setAboutInView(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Trigger sekali saat component mount untuk check initial position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [aboutInView]);

  // Buat array yang di-duplicate sesuai LOOP_COUNT
  const infinitePrestasiImages = Array(LOOP_COUNT).fill(prestasiImages).flat();

  return (
    <div className="main-container">
      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div 
          className={`home-container ${bgLoaded ? 'bg-loaded' : ''}`}
          style={{ backgroundImage: `url(${homeBg})` }}
        >
          <div className="mobile-hero-content">
            <img 
              src={kepsek} 
              alt="Kepala Sekolah" 
              className="kepsek-image"
            />
            <div className="name-background">
              <div className="scrolling-names">
                <span className="scrolling-name">RAHAYU</span>
                <span className="scrolling-name">ASYHARI</span>
                <span className="scrolling-name">RAHAYU</span>
                <span className="scrolling-name">ASYHARI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Prestasi */}
      <section id="prestasi" className="prestasi-section">
        <div className="section-content">
          <div className="prestasi-header">
            <h2 className="section-title">PRESTASI</h2>
            <p className="section-subtitle">Our achievements and accomplishments</p>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading prestasi...</p>
            </div>
          ) : prestasiImages.length > 0 ? (
            <div className="prestasi-gallery-container auto-scroll">
              <div className="prestasi-scrolling-gallery">
                  {infinitePrestasiImages.map((image, index) => (
                  <div 
                    key={`${image.id}-${index}`} 
                    className={`prestasi-image-wrapper ${
                      image.aspectRatio === '9:16' ? 'portrait' : 'landscape'
                    }`}
                  >
                    <img 
                      src={image.imageBase64}
                      alt={`Prestasi ${index + 1}`}
                      className="prestasi-image"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>Belum ada gambar prestasi. Silakan upload di admin panel.</p>
            </div>
          )}
        </div>
      </section>

      {/* Section ISBN - Buku Digital dengan PDF Viewer yang bisa di-scroll */}
      <BookSection />

      {/* Section About dengan Animasi */}
      <section id="about" className="about-section">
        <div className={`about-content ${aboutInView ? 'animate-about' : ''}`}>
          <h1 className={`about-title ${aboutInView ? 'animate-title' : ''}`}>
            ABOUT
          </h1>
          <p className={`about-text ${aboutInView ? 'animate-text' : ''}`}>
            Halo! Saya Ayu, seorang perempuan yang lahir di Kota Samarinda 28 Agustus Indonesia. Saya tumbuh dengan kecintaan pada pembelajaran, kreativitas, dan eksplorasi hal-hal baru yang membantu saya berkembang sebagai pribadi maupun profesional.

Saya percaya bahwa setiap perjalanan hidup membawa pelajaran berharga. Karena itu, saya selalu berusaha menghadirkan karya, gagasan, dan pengalaman yang tidak hanya bermanfaat bagi diri sendiri, tetapi juga bagi orang-orang di sekitar saya. Melalui website ini, saya ingin berbagi cerita, pemikiran, dan karya yang saya bangun dengan penuh ketulusan.

Terima kasih sudah berkunjung, semoga apa yang saya bagikan di sini dapat memberi inspirasi, wawasan, atau bahkan sekadar menemani hari Anda.
          </p>
          
          {/* Media Sosial */}
          <div className={`social-media ${aboutInView ? 'animate-social' : ''}`}>
            <div className="social-title">Follow Us:</div>
            <div className="social-icons">
              {socialMedia.map((social, index) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="social-icon-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${social.name}`}
                  style={{ animationDelay: `${0.7 + (index * 0.1)}s` }}
                >
                  <img 
                    src={social.icon} 
                    alt={social.name}
                    className="social-icon"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;