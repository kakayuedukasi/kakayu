import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './NewsDetail.css';

const NewsDetail = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load news detail dari Firebase
  useEffect(() => {
    const loadNewsDetail = async () => {
      try {
        const newsDoc = await getDoc(doc(db, 'news', id));
        if (newsDoc.exists()) {
          setNewsItem({
            id: newsDoc.id,
            ...newsDoc.data()
          });
        } else {
          setError('News tidak ditemukan');
        }
      } catch (error) {
        console.error('Error loading news detail:', error);
        setError('Error loading news detail');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadNewsDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="news-detail-page">
        <div className="news-detail-container">
          <div className="loading">Loading news detail...</div>
        </div>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="news-detail-page">
        <div className="news-detail-container">
          <h1>{error || 'News tidak ditemukan'}</h1>
          <Link to="/news" className="back-button">← Kembali ke News</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="news-detail-page">
      <div className="news-detail-container">
        {/* Back Button */}
        <Link to="/news" className="back-button">
          ← Back to News
        </Link>
        
        {/* Main Content */}
        <article className="news-article">
          {/* Header */}
          <header className="news-header-detail">
            <div className="news-meta-detail">
              <span className="news-category-detail">{newsItem.category}</span>
              <span className="news-date-detail">{newsItem.date}</span>
            </div>
            <h1 className="news-title-detail">{newsItem.title}</h1>
          </header>

          {/* Featured Image */}
          {newsItem.imageBase64 && (
            <div className="news-image-detail-container">
              <img 
                src={newsItem.imageBase64}  // PAKAI imageBase64
                alt={newsItem.title}
                className="news-image-detail"
              />
            </div>
          )}

          {/* Content */}
          {newsItem.content && (
            <div 
              className="news-content-detail"
              dangerouslySetInnerHTML={{ __html: newsItem.content }}
            />
          )}

          {/* Videos Section */}
          {newsItem.videoUrl && (
            <div className="videos-section">
              <h2 className="videos-title">Related Video</h2>
              <div className="videos-grid">
                <div className="video-container">
                  <iframe
                    src={newsItem.videoUrl}
                    title="News Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="video-iframe"
                  ></iframe>
                </div>
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default NewsDetail;