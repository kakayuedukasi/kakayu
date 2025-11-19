import React from 'react';
import './BookSection.css';

const BookSection = () => {
  // Hanya 1 buku
  const book = {
    title: "Buku Digital Kami",
    pdfUrl: "https://drive.google.com/file/d/1d9uySPSukQ-qO0PRDrYQ25rAtNukqSjv/preview"
  };

  return (
    <section id="isbn" className="book-section">
      <div className="section-content">
        <div className="book-header">
          <h2 className="section-title">BUKU DIGITAL ISBN</h2>
          <p className="section-subtitle">Karya literasi digital Guru KB & TK Laboratorium UM Malang</p>
        </div>

        <div className="pdf-direct-container">
          <div className="pdf-wrapper">
            <iframe
              src={book.pdfUrl}
              className="pdf-direct-iframe"
              title={`PDF - ${book.title}`}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookSection;