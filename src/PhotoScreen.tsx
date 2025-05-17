import React, { useState, useEffect, useRef } from 'react';
import './PhotoScreen.css';

interface PhotoScreenProps {
  photos: { url: string; title: string }[];
  captions: string[];
  currentPhotoIndex: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  sounds: { photo: string };
}

const PhotoScreen: React.FC<PhotoScreenProps> = ({
  photos,
  captions,
  currentPhotoIndex,
  onNavigate,
  sounds,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const photoSoundRef = useRef<HTMLAudioElement>(null);
  
  // Preload the current image and get its aspect ratio
  useEffect(() => {
    setIsLoading(true);
    
    const img = new Image();
    img.src = photos[currentPhotoIndex].url;
    
    img.onload = () => {
      setImageAspectRatio(img.naturalWidth / img.naturalHeight);
      setIsLoading(false);
      
      // Play photo sound when a new photo is loaded
      if (photoSoundRef.current) {
        photoSoundRef.current.currentTime = 0;
        photoSoundRef.current.play().catch(err => console.warn("Error playing photo sound:", err));
      }
    };
    
    img.onerror = () => {
      setIsLoading(false);
      console.error("Failed to load image:", photos[currentPhotoIndex].url);
    };
  }, [currentPhotoIndex, photos]);
  
  // Determine if photo should use vertical orientation based on aspect ratio
  const isVertical = imageAspectRatio < 1;
  
  // Calculate photo position in sequence
  const currentPosition = currentPhotoIndex + 1;
  const totalPhotos = photos.length;
  const isFirstPhoto = currentPhotoIndex === 0;
  const isLastPhoto = currentPhotoIndex === photos.length - 1;
  
  return (
    <div className="photo-screen">
      <audio ref={photoSoundRef} src={sounds.photo} />
      
      <div className="photo-frame-container">
        
        <div className={`photo-display-area ${isVertical ? 'vertical' : 'horizontal'}`}>
          <div className={`photo-frame ${isVertical ? 'vertical' : ''}`}>
            {isLoading ? (
              <div className="photo-loading">
                <div className="loading-spinner"></div>
                <span>Loading image...</span>
              </div>
            ) : (
              <img 
                src={photos[currentPhotoIndex].url} 
                alt={photos[currentPhotoIndex].title}
                className="photo-image"
              />
            )}
          </div>
        </div>
        
        <div className="photo-caption-container">
          <div className="photo-caption">
            {captions[currentPhotoIndex]}
          </div>
        </div>
        
        <div className="photo-controls">  
          <div className="photo-navigation">
            <button 
              className={`photo-nav-button prev ${isFirstPhoto ? 'disabled' : ''}`}
              onClick={() => onNavigate('prev')}
              disabled={isFirstPhoto}
              aria-label="Previous photo"
            >
              <span className="nav-icon">&lt;</span>
              <span className="nav-text"></span>
            </button>
            
            <div className="photo-counter">
              <span className="current-number">{currentPosition}</span>
              <span className="photo-counter-divider">/</span>
              <span className="total-number">{totalPhotos}</span>
            </div>
            
            <button 
              className={`photo-nav-button next ${isLastPhoto ? 'disabled' : ''}`}
              onClick={() => onNavigate('next')}
              disabled={isLastPhoto}
              aria-label="Next photo"
            >
              <span className="nav-text"></span>
              <span className="nav-icon">&gt;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoScreen;