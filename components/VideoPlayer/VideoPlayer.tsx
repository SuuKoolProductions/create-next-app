import React, { useState } from 'react';
import ClipControls from './ClipControls';

const VideoPlayer: React.FC = () => {
  const [showClipControls, setShowClipControls] = useState(false);

  return (
    <div className="video-container">
      <div className="video-controls">
        <button 
          id="clip-button" 
          className="glitch-button"
          onClick={() => setShowClipControls(!showClipControls)}
        >
          <div className="relative">
            <div className="green-item-stroke">CLIP IT</div>
            <div className="green-item-no-stroke">CLIP IT</div>
          </div>
        </button>
        {showClipControls && <ClipControls />}
      </div>
      <div className="video-wrapper">
        <mux-player
          playback-id="tk00bQacIwGQgNfIaU9DyQTkLKOB5n00008e5HBUgJkQKI"
          metadata-video-title="Placeholder (optional)"
          metadata-viewer-user-id="Placeholder (optional)"
          primary-color="#ffffff"
          secondary-color="#000000"
          accent-color="#fa50b5"
        />
      </div>
    </div>
  );
};

export default VideoPlayer; 