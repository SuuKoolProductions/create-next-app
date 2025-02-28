import Head from "next/head";
import CRTOverlay from '../components/Layout/CRTOverlay';
import BackgroundVideo from '../components/Layout/BackgroundVideo';
import Navigation from '../components/Navigation/Navigation';
import LoadingOverlay from '../components/LoadingOverlay/LoadingOverlay';
import React from 'react';
import MuxPlayer from "@mux/mux-player-react";
import Link from 'next/link';

interface Clip {
  id: string;
  title: string;
  playbackId: string;
  thumbnailUrl: string;
}

export default function ClipsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [clips, setClips] = React.useState<Clip[]>([]);
  const [selectedClip, setSelectedClip] = React.useState<Clip | null>(null);

  React.useEffect(() => {
    document.body.classList.add('clips-page');
    return () => {
      document.body.classList.remove('clips-page');
    };
  }, []);

  React.useEffect(() => {
    // Fetch clips when component mounts
    fetch('/api/clips')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {  // Make sure data is an array
          setClips(data);
        } else {
          console.error('Expected array of clips, got:', data);
          setClips([]);
        }
      })
      .catch(error => {
        console.error('Error fetching clips:', error);
        setClips([]);  // Set empty array on error
      });
  }, []);

  const handleInitialize = () => {
    const hoverSound = document.getElementById('hover-sound') as HTMLAudioElement;
    const selectSound = document.getElementById('select-sound') as HTMLAudioElement;
    
    Promise.all([
      hoverSound.play().then(() => hoverSound.pause()),
      selectSound.play().then(() => selectSound.pause())
    ]).catch(console.error);

    setIsLoading(false);
  };

  const handleClipClick = (clip: Clip) => {
    setSelectedClip(clip);
  };

  return (
    <>
      <Head>
        <title>Clips · DegenSwim</title>
      </Head>

      <audio id="hover-sound">
        <source src="/sounds/menu-hover.mp3" type="audio/mpeg" />
      </audio>
      <audio id="select-sound">
        <source src="/sounds/menu-select.mp3" type="audio/mpeg" />
      </audio>

      {/* Video Modal */}
      {selectedClip && (
        <div className="video-modal">
          <div className="video-modal-content">
            <button 
              onClick={() => setSelectedClip(null)}
              className="video-modal-close"
            >
              [CLOSE]
            </button>
            <div className="video-modal-player">
              <MuxPlayer
                playbackId={selectedClip.playbackId}
                metadata={{
                  video_id: selectedClip.id,
                  video_title: selectedClip.title,
                  viewer_user_id: "user-id-123"
                }}
                accentColor="#00f3ff"
                primaryColor="#ffffff"
                secondaryColor="#000000"
              />
            </div>
          </div>
        </div>
      )}

      <LoadingOverlay 
        isVisible={isLoading} 
        onInitialize={handleInitialize}
        title="[MISSED OUT ON THE FUN?]"
        subtitle="[WE'VE GOT YOU COVERED DON'T FOMO]"
        buttonText="Watch Clips!"
      />

      <canvas id="gridCanvas" className="fixed top-0 left-0 w-full h-full z-0" />
      <CRTOverlay />
      <BackgroundVideo />
      
      <div className="relative z-10 min-h-screen overflow-hidden !mt-[575px]">
        <div className="container mx-auto px-4 relative">
          <Link href="/" className="cursor-pointer">
            <div className="cyber-title">
              <div className="title-layer-1">[DEGENSWIM]</div>
              <div className="title-layer-2">[DEGENSWIM]</div>
              <div className="title-layer-3">[DEGENSWIM]</div>
            </div>
          </Link>
          
          <Navigation />

          <main className="content relative z-10 pt-[225px]">
            {/* Clips Grid */}
            <div className="max-w-[1600px] mx-auto px-8">
              <div className="grid grid-cols-4 gap-x-6 gap-y-8">
                {Array.isArray(clips) && clips.map((clip, index) => (
                  <div 
                    key={clip.id} 
                    className="w-full cursor-pointer" 
                    onClick={() => handleClipClick(clip)}
                  >
                    <div className="aspect-video bg-black/30 rounded-lg overflow-hidden border-2 border-[#00f3ff]/30 hover:border-[#00f3ff] transition-all duration-300 group">
                      <img 
                        src={clip.thumbnailUrl}
                        alt={`DegenSwim Stream ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback for missing thumbnails
                          e.currentTarget.src = `https://image.mux.com/${clip.playbackId}/thumbnail.webp?time=1&width=240&height=135`;
                        }}
                      />
                      <div className="absolute inset-0 bg-[#00f3ff]/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <h3 className="mt-2 text-[#00f3ff] text-sm text-center font-['Press_Start_2P']">
                      DegenSwim Stream {index + 1}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="social-container">
              <a href="https://twitter.com/degenswim" className="social-button" target="_blank">
                <div className="relative">
                  <div className="blue-item-stroke">X</div>
                  <div className="blue-item-no-stroke">X</div>
                </div>
              </a>
            </div>
          </main>
        </div>
      </div>
    </>
  );
} 