import React, { useState, useEffect } from 'react';

interface LoadingOverlayProps {
  onInitialize: () => void;
  isVisible: boolean;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  showButton?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  onInitialize, 
  isVisible, 
  title = "[degen swim]",
  subtitle = "unscripted and onchain",
  buttonText = "ENTER",
  showButton = true
}) => {
  const [buttonLoaded, setButtonLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Prevent scrolling when overlay is visible
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const playSelectSound = () => {
    const audio = document.getElementById('select-sound') as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const handleClick = () => {
    playSelectSound();
    onInitialize();
  };

  return (
    <div 
      className="loading-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'opacity 0.8s cubic-bezier(0.65, 0, 0.35, 1)',
      }}
    >
      <div className="loading-content text-center" style={{ padding: '2rem' }}>
        <h2 className="text-4xl mb-4" style={{ color: '#00f3ff', textShadow: '0 0 10px rgba(0, 243, 255, 0.8)' }}>
          {title}
        </h2>
        <h1 className="text-2xl mb-12" style={{ color: '#90ee90', textShadow: '0 0 10px rgba(144, 238, 144, 0.8)' }}>
          {subtitle}
        </h1>
        <div className="mt-8 flex justify-center">
          {showButton ? (
            <button 
              className="glitch-button"
              onClick={handleClick}
              style={{
                opacity: buttonLoaded ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
              }}
            >
              <div className="relative">
                <div className="green-item-stroke">{buttonText}</div>
                <div className="green-item-no-stroke">{buttonText}</div>
              </div>
            </button>
          ) : (
            <div className="loading-spinner-large">
              <div className="spinner-circle-large"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay; 