import React, { useEffect, useRef } from 'react';

interface NoiseBackgroundProps {
  opacity?: number;
  blendMode?: string;
}

const NoiseBackground: React.FC<NoiseBackgroundProps> = ({ 
  opacity = 0.5,
  blendMode = 'multiply'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.error("Video play error:", err));
    }
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        zIndex: 10,
        overflow: 'hidden'
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{ 
          opacity: opacity, 
          mixBlendMode: blendMode as any,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(1.1)',
          minWidth: '101vw',
          minHeight: '101vh',
          width: 'auto',
          height: 'auto',
          objectFit: 'cover'
        }}
      >
        <source src="/assets/noise.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default NoiseBackground; 