import React, { useState, useEffect } from 'react';
import '../assets/Slidebars.css';

const Slidebars = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch images from the API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('http://localhost:7000/Slidebars');
        const data = await response.json();
        setImages(data); // Assuming the response is an array of objects
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };
    fetchImages();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [images]);

  if (images.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="slider-container">
      {images.map((image, index) => (
        <div
          key={image._id}
          className={`slide ${index === currentIndex ? 'active' : ''}`}
        >
          <img
            src={`http://localhost:7000/uploads/${image.image}`}
            alt={image.name}
            className="slide-image"
          />
        </div>
      ))}

      {/* Controls for manual navigation */}
      <button
        className="prev"
        onClick={() =>
          setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1)
        }
      >
        &#10094;
      </button>
      <button
        className="next"
        onClick={() =>
          setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1)
        }
      >
        &#10095;
      </button>
    </div>
  );
};

export default Slidebars;
