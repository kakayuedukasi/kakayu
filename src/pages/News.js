import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import './News.css';

const News = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedNews, setSelectedNews] = useState(null);

  // Load news dari Firebase
  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsQuery = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        const newsSnapshot = await getDocs(newsQuery);
        const newsData = newsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setNews(newsData);
        setFilteredNews(newsData);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  // Filter news berdasarkan kategori
  const filterNews = (category) => {
    setActiveFilter(category);
    if (category === 'ALL') {
      setFilteredNews(news);
    } else {
      const filtered = news.filter(item => item.category === category);
      setFilteredNews(filtered);
    }
  };

  // Dapatkan semua kategori unik
  const categories = ['ALL', 'NARASUMBER', 'PENDONGENG', 'PRESTASI'];

  if (loading) {
    return (
      <div className="news-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading news...</p>
        </div>
      </div>
    );
  }

  // Tampilkan semua news dengan deskripsi lengkap
  return (
    <div className="news-page">
      <div className="news-container">
        {/* Header */}
        <div className="news-header">
          <h1 className="news-title">EXPERIENCE</h1>
          <p className="news-subtitle">Latest updates and activities</p>
        </div>

        {/* Filter Buttons */}
        <div className="filter-container">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
              onClick={() => filterNews(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* News List - Tampil Semua Deskripsi */}
        {filteredNews.length > 0 ? (
          <div className="news-list-left">
            {filteredNews.map((item) => (
              <div 
                key={item.id}
                className="news-item-left"
              >
                {/* Gambar di atas */}
                <div className="news-image-left">
                  {item.imageBase64 && (
                    <img 
                      src={item.imageBase64}
                      alt={item.title}
                      className="left-image"
                    />
                  )}
                </div>

                {/* Konten di bawah gambar - SEMUA DESKRIPSI DITAMPILKAN */}
                <div className="news-content-left">
                  <div className="news-meta-left">
                    <span className="news-category-left">{item.category}</span>
                    <span className="news-date-left">{item.date}</span>
                  </div>
                  
                  <h2 className="news-title-left">{item.title}</h2>
                  
                  {item.content && (
                    <div 
                      className="news-description-full"
                      dangerouslySetInnerHTML={{ 
                        __html: item.content
                      }}
                    />
                  )}

                  {/* Video jika ada */}
                  {item.videoUrl && (
                    <div className="video-preview">
                      <h3>Related Video</h3>
                      <div className="video-container-preview">
                        <iframe
                          src={item.videoUrl}
                          title="News Video"
                          frameBorder="0"
                          allowFullScreen
                          className="video-iframe-preview"
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>Belum ada news. Silakan tambah news di admin panel.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;