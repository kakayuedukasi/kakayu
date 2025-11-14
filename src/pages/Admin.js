import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  query,
  orderBy 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { db, auth } from '../firebase';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './Admin.css';

// Default crop configuration
const defaultCrop = {
  unit: '%',
  width: 90,
  height: 90,
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState('prestasi');
  const [prestasiImages, setPrestasiImages] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Crop states
  const [crop, setCrop] = useState(defaultCrop);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(16/9); // Default landscape
  const [showCropModal, setShowCropModal] = useState(false);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'NARASUMBER',
    content: '',
    videoUrl: '',
    newsImage: null,
    newsImagePreview: ''
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Check auth state dan hide navbar
  useEffect(() => {
    // Hide navbar ketika masuk admin
    const hideNavbar = () => {
      const navbar = document.querySelector('nav, header, .navbar, .navigation, [role="navigation"]');
      if (navbar) {
        navbar.style.display = 'none';
      }
    };

    hideNavbar();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        loadData();
      }
    });

    // Cleanup function - restore navbar ketika keluar
    return () => {
      const showNavbar = () => {
        const navbar = document.querySelector('nav, header, .navbar, .navigation, [role="navigation"]');
        if (navbar) {
          navbar.style.display = '';
        }
      };
      showNavbar();
    };
  }, []);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login gagal! Periksa email dan password.');
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Restore navbar setelah logout
      const showNavbar = () => {
        const navbar = document.querySelector('nav, header, .navbar, .navigation, [role="navigation"]');
        if (navbar) {
          navbar.style.display = '';
        }
      };
      showNavbar();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle aspect ratio change
  const handleAspectRatioChange = (ratio) => {
    setAspectRatio(ratio);
    setCrop({
      unit: '%',
      width: 90,
      aspect: ratio,
    });
  };

  // Handle image selection for prestasi
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB untuk Base64)
      if (file.size > 2 * 1024 * 1024) {
        alert('File terlalu besar! Maksimal 2MB untuk kualitas terbaik.');
        return;
      }
      
      setNewImage(file);
      const base64 = await convertToBase64(file);
      setImagePreview(base64);
      setShowCropModal(true);
      
      // Reset crop dengan aspect ratio default
      setCrop({
        unit: '%',
        width: 90,
        aspect: aspectRatio,
      });
    }
  };

  // Handle image load for crop
  const onImageLoad = (img) => {
    imgRef.current = img;
  };

  // Generate cropped image
  const generateCroppedImage = () => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return null;
    }

    const canvas = previewCanvasRef.current;
    const crop = completedCrop;
    const image = imgRef.current;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });
  };

  // Handle crop completion
  const handleCropComplete = async () => {
    try {
      const croppedImageBlob = await generateCroppedImage();
      if (croppedImageBlob) {
        const croppedFile = new File([croppedImageBlob], `cropped-${newImage.name}`, {
          type: 'image/jpeg'
        });
        
        // Update preview dengan gambar yang sudah di-crop
        const croppedBase64 = await convertToBase64(croppedFile);
        setImagePreview(croppedBase64);
        setNewImage(croppedFile);
      }
      setShowCropModal(false);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Error cropping image');
    }
  };

  // Convert image to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Handle image selection for news
  const handleNewsImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File terlalu besar! Maksimal 2MB untuk kualitas terbaik.');
        return;
      }
      
      const base64 = await convertToBase64(file);
      setNewsForm({
        ...newsForm,
        newsImage: file,
        newsImagePreview: base64
      });
    }
  };

  // Load data dari Firebase
  const loadData = async () => {
    try {
      // Load prestasi images
      const prestasiQuery = query(collection(db, 'prestasi'), orderBy('createdAt', 'desc'));
      const prestasiSnapshot = await getDocs(prestasiQuery);
      const prestasiData = prestasiSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrestasiImages(prestasiData);

      // Load news items
      const newsQuery = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
      const newsSnapshot = await getDocs(newsQuery);
      const newsData = newsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNewsItems(newsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Upload gambar prestasi - BASE64 VERSION
  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!newImage) {
      alert('Pilih gambar terlebih dahulu!');
      return;
    }

    try {
      // Convert to Base64
      const base64String = await convertToBase64(newImage);

      // Simpan ke Firestore
      await addDoc(collection(db, 'prestasi'), {
        imageBase64: base64String,
        fileName: newImage.name,
        fileSize: newImage.size,
        fileType: newImage.type,
        aspectRatio: aspectRatio === 16/9 ? '16:9' : '9:16',
        createdAt: new Date().toISOString(),
        uploadedBy: user.email
      });

      alert('✅ Gambar prestasi berhasil diupload!');
      setNewImage(null);
      setImagePreview('');
      setCrop(defaultCrop);
      setCompletedCrop(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      loadData();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('❌ Error uploading image');
    }
  };

  // Add news item - BASE64 VERSION
  const handleAddNews = async (e) => {
    e.preventDefault();
    
    try {
      let imageBase64 = '';
      
      // Convert news image to Base64 jika ada
      if (newsForm.newsImage) {
        imageBase64 = await convertToBase64(newsForm.newsImage);
      }

      // Simpan ke Firestore
      await addDoc(collection(db, 'news'), {
        title: newsForm.title,
        category: newsForm.category,
        content: newsForm.content,
        videoUrl: newsForm.videoUrl,
        imageBase64: imageBase64,
        fileName: newsForm.newsImage ? newsForm.newsImage.name : '',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        createdBy: user.email
      });

      alert('✅ News berhasil ditambahkan!');
      setNewsForm({
        title: '',
        category: 'NARASUMBER',
        content: '',
        videoUrl: '',
        newsImage: null,
        newsImagePreview: ''
      });
      loadData();
    } catch (error) {
      console.error('Error adding news:', error);
      alert('Error adding news');
    }
  };

  // Delete item
  const handleDelete = async (collectionName, id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus?')) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        loadData();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Error deleting item');
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Login form
  if (!user) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <h1>Admin Login</h1>
          <p>Silakan login dengan akun admin</p>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Admin Panel</h1>
          <p className="user-info">Logged in as: {user.email}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'prestasi' ? 'active' : ''}
          onClick={() => setActiveTab('prestasi')}
        >
          Manage Prestasi
        </button>
        <button 
          className={activeTab === 'news' ? 'active' : ''}
          onClick={() => setActiveTab('news')}
        >
          Manage News
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'prestasi' && (
          <div className="prestasi-admin">
            <h2>Upload Gambar Prestasi</h2>
            <div className="upload-info">
              <p><strong>✨ Fitur Baru:</strong> Crop gambar dengan ratio yang dapat disesuaikan!</p>
              <p><small>Pilih gambar terlebih dahulu, lalu atur ratio dan crop di modal yang muncul</small></p>
              <p><small>Maksimal 2MB per gambar. Format: JPG, PNG, GIF</small></p>
            </div>
            
            <form onSubmit={handleImageUpload}>
              <div className="file-input-group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  required
                />

                {imagePreview && (
                  <div className="image-preview">
                    <p>Preview Gambar (Setelah Crop):</p>
                    <img src={imagePreview} alt="Preview" />
                    <div className="image-info">
                      <small>Ratio: {aspectRatio === 16/9 ? '16:9 (Landscape)' : '9:16 (Portrait)'}</small>
                      <br />
                      <small>File: {newImage?.name}</small>
                      <br />
                      <small>Size: {(newImage?.size / 1024).toFixed(1)} KB</small>
                    </div>
                  </div>
                )}
              </div>
              <button type="submit" disabled={!newImage}>
                Upload Gambar
              </button>
            </form>

            {/* Crop Modal */}
            {showCropModal && (
              <div className="crop-modal-overlay">
                <div className="crop-modal">
                  <div className="crop-modal-header">
                    <h3>Crop Gambar</h3>
                    <p>Pilih ratio dan atur area crop sesuai keinginan</p>
                    
                    {/* Ratio Selection - DIPINDAH KE MODAL */}
                    <div className="ratio-selection-modal">
                      <label>Pilih Ratio:</label>
                      <div className="ratio-buttons">
                        <button 
                          type="button"
                          className={`ratio-btn ${aspectRatio === 16/9 ? 'active' : ''}`}
                          onClick={() => handleAspectRatioChange(16/9)}
                        >
                          16:9 (Landscape)
                        </button>
                        <button 
                          type="button"
                          className={`ratio-btn ${aspectRatio === 9/16 ? 'active' : ''}`}
                          onClick={() => handleAspectRatioChange(9/16)}
                        >
                          9:16 (Portrait)
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="crop-container">
                    <ReactCrop
                      crop={crop}
                      onChange={(newCrop) => setCrop(newCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={aspectRatio}
                      minWidth={100}
                      minHeight={100}
                    >
                      <img
                        ref={imgRef}
                        src={imagePreview}
                        onLoad={(e) => onImageLoad(e.currentTarget)}
                        alt="Crop preview"
                        style={{ maxHeight: '60vh', maxWidth: '100%' }}
                      />
                    </ReactCrop>
                  </div>

                  <div className="crop-modal-actions">
                    <button 
                      type="button" 
                      className="cancel-crop-btn"
                      onClick={() => {
                        setShowCropModal(false);
                        setNewImage(null);
                        setImagePreview('');
                      }}
                    >
                      Batal
                    </button>
                    <button 
                      type="button" 
                      className="apply-crop-btn"
                      onClick={handleCropComplete}
                    >
                      Terapkan Crop
                    </button>
                  </div>

                  {/* Hidden canvas for crop generation */}
                  <canvas
                    ref={previewCanvasRef}
                    style={{
                      display: 'none',
                      width: completedCrop?.width,
                      height: completedCrop?.height,
                    }}
                  />
                </div>
              </div>
            )}

            <h3>Daftar Gambar Prestasi ({prestasiImages.length})</h3>
            <div className="prestasi-list">
              {prestasiImages.map((item) => (
                <div key={item.id} className="prestasi-item">
                  <img src={item.imageBase64} alt="Prestasi" />
                  <div className="item-info">
                    <strong>{item.fileName}</strong>
                    <br />
                    <small>Ratio: {item.aspectRatio || 'Original'}</small>
                    <br />
                    <small>Size: {(item.fileSize / 1024).toFixed(1)} KB</small>
                    <br />
                    <small>Added: {new Date(item.createdAt).toLocaleDateString()}</small>
                  </div>
                  <button 
                    onClick={() => handleDelete('prestasi', item.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="news-admin">
            <h2>Tambah News Baru</h2>
            
            <div className="upload-info">
              <p><strong>📝 Format News Baru:</strong> Gambar + Judul + Deskripsi akan ditampilkan di layout split view</p>
              <p><small>Gambar akan ditampilkan di sebelah kiri, konten di sebelah kanan</small></p>
            </div>
            
            <form onSubmit={handleAddNews}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Judul News *</label>
                  <input
                    type="text"
                    placeholder="Masukkan judul news..."
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Kategori *</label>
                  <select
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({...newsForm, category: e.target.value})}
                  >
                    <option value="NARASUMBER">Narasumber</option>
                    <option value="PENDONGENG">Pendongeng</option>
                    <option value="PRESTASI">Prestasi</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Gambar Utama *</label>
                <p className="input-help">Gambar akan ditampilkan di bagian kiri layout</p>
                <div className="file-input-with-preview">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewsImageSelect}
                    required
                  />
                  {newsForm.newsImagePreview && (
                    <div className="image-preview-card">
                      <p>Preview Gambar:</p>
                      <img src={newsForm.newsImagePreview} alt="Preview" />
                      <div className="image-info">
                        <small>File: {newsForm.newsImage?.name}</small>
                        <br />
                        <small>Size: {newsForm.newsImage ? (newsForm.newsImage.size / 1024).toFixed(1) + ' KB' : 'N/A'}</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Konten/Deskripsi *</label>
                <p className="input-help">Deskripsi akan ditampilkan di sebelah kanan gambar. Gunakan HTML untuk formatting.</p>
                <textarea
                  placeholder="Masukkan deskripsi lengkap berita..."
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                  rows="8"
                  required
                ></textarea>
                <div className="formatting-help">
                  <small><strong>Tips Formatting:</strong></small>
                  <br />
                  <small>• Gunakan &lt;strong&gt;text&lt;/strong&gt; untuk <strong>teks tebal</strong></small>
                  <br />
                  <small>• Gunakan &lt;em&gt;text&lt;/em&gt; untuk <em>teks miring</em></small>
                  <br />
                  <small>• Gunakan &lt;br&gt; untuk baris baru</small>
                  <br />
                  <small>• Gunakan &lt;ul&gt;&lt;li&gt;item&lt;/li&gt;&lt;/ul&gt; untuk list</small>
                </div>
              </div>

              <div className="form-group">
                <label>YouTube Video URL (Opsional)</label>
                <p className="input-help">Jika ada video terkait, masukkan link YouTube</p>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newsForm.videoUrl}
                  onChange={(e) => setNewsForm({...newsForm, videoUrl: e.target.value})}
                />
              </div>

              <button type="submit" className="submit-btn">Tambah News</button>
            </form>

            <h3>Daftar News ({newsItems.length})</h3>
            <div className="news-list-admin">
              {newsItems.map((item) => (
                <div key={item.id} className="news-item-admin">
                  <div className="news-item-preview">
                    {item.imageBase64 && (
                      <div className="news-image-admin">
                        <img src={item.imageBase64} alt={item.title} />
                      </div>
                    )}
                    <div className="news-content-admin">
                      <h4>{item.title}</h4>
                      <div className="news-meta-admin">
                        <span className="category-badge">{item.category}</span>
                        <span className="news-date-admin">{item.date}</span>
                      </div>
                      <div className="content-preview-admin">
                        <span dangerouslySetInnerHTML={{ 
                          __html: item.content.length > 150 
                            ? item.content.substring(0, 150) + '...' 
                            : item.content 
                        }} />
                      </div>
                      <div className="news-stats">
                        <small>Created: {new Date(item.createdAt).toLocaleDateString('id-ID')}</small>
                        {item.videoUrl && <small className="has-video">🎥 Ada Video</small>}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete('news', item.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;