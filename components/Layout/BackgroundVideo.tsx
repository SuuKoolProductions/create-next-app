import React from 'react';

const BackgroundVideo: React.FC = () => {
  return (
    <video className="background-video" autoPlay loop muted playsInline>
      <source src="/assets/degennoise.mp4" type="video/mp4" />
    </video>
  );
};

export default BackgroundVideo; 