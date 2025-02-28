import Head from "next/head";
import CRTOverlay from '../components/Layout/CRTOverlay';
import BackgroundVideo from '../components/Layout/BackgroundVideo';
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import MuxPlayer from "@mux/mux-player-react";
import LoadingOverlay from '../components/LoadingOverlay/LoadingOverlay';

interface Clip {
  id: string;
  title: string;
  playbackId: string;
  thumbnailUrl: string;
}

const NavButton = ({ children, href }: { children: React.ReactNode; href: string }) => {
  const router = useRouter();
  const isActive = router.pathname === href;
  
  return (
    <button 
      className={`nav-button ${isActive ? 'active' : ''}`}
      onClick={() => router.push(href)}
    >
      {children}
    </button>
  );
};

export default function ClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [isClipsLoading, setIsClipsLoading] = useState(true);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Instead of duplicating the loading logic, simply call handleInitialize
    // on component mount to start loading immediately
    handleInitialize();
  }, []);

  const handleInitialize = () => {
    const hoverSound = document.getElementById('hover-sound') as HTMLAudioElement;
    const selectSound = document.getElementById('select-sound') as HTMLAudioElement;
    
    // Play sound effects
    Promise.all([
      hoverSound?.play().then(() => hoverSound.pause()).catch(() => {}),
      selectSound?.play().then(() => selectSound.pause()).catch(() => {})
    ]).catch(() => console.log('Audio initialization failed, but continuing...'));

    // Set a fallback timer to prevent infinite loading
    const fallbackTimer = setTimeout(() => {
      console.log('Using fallback timer to complete loading');
      setShowButton(true);
      setIsClipsLoading(false);
    }, 5000); // 5 second fallback

    // Continue with clips loading
    const fetchClips = async () => {
      setIsClipsLoading(true);
      try {
        console.log('Fetching clips data...');
        const res = await fetch('/api/clips');
        const data = await res.json();
        console.log('Clips data received:', data);
        
        if (Array.isArray(data)) {
          setClips(data);
        } else {
          console.error('Expected array of clips, got:', data);
          setClips([]);
        }
      } catch (error) {
        console.error('Error fetching clips:', error);
        setClips([]);
      } finally {
        // Clear the fallback timer since we're done loading
        clearTimeout(fallbackTimer);
        
        // Use a shorter delay for a better user experience
        console.log('Loading complete, showing button...');
        setShowButton(true);
        
        // Allow small delay for button to appear before hiding overlay
        setTimeout(() => {
          console.log('Hiding loading overlay');
          setIsClipsLoading(false);
        }, 800);
      }
    };

    // Start loading immediately
    fetchClips();
  };

  const handleClipClick = (clip: Clip) => {
    setSelectedClip(clip);
  };

  return (
    <>
      <Head>
        <title>Clips · DegenSwim</title>
        {/* Combined styles */}
        <style jsx global>{`
          body {
            margin: 0;
            padding: 0;
          }
          
          .footer-button {
            display: inline-block;
            padding: 0 15px;
            font-family: 'VT323', monospace;
            font-size: 16px;
            line-height: 48px;
            text-transform: uppercase;
            cursor: pointer;
            color: #333;
            font-weight: bold;
            transition: all 0.2s ease;
            position: relative;
          }
          
          .footer-button:hover {
            color: #ff00ff;
            text-shadow: 0 0 8px rgba(255, 0, 255, 0.6);
          }
          
          .footer-button:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background: #ff00ff;
            transition: all 0.2s ease;
            transform: translateX(-50%);
          }
          
          .footer-button:hover:after {
            width: 80%;
          }
        `}</style>
      </Head>

      <audio id="hover-sound">
        <source src="/sounds/menu-hover.mp3" type="audio/mpeg" />
      </audio>
      <audio id="select-sound">
        <source src="/sounds/menu-select.mp3" type="audio/mpeg" />
      </audio>

      <LoadingOverlay 
        isVisible={isClipsLoading} 
        onInitialize={handleInitialize}
        title="[MISSED OUT ON THE FUN?]"
        subtitle="[WE'VE GOT YOU COVERED DON'T FOMO]"
        buttonText="Watch Clips!"
        showButton={showButton}
      />

      <canvas id="gridCanvas" className="fixed top-0 left-0 w-full h-full z-0" />
      <CRTOverlay />
      <BackgroundVideo />
      
      {/* Video Modal */}
      {selectedClip && (
        <div className="video-modal fixed top-0 left-0 w-full h-full flex items-center justify-center z-50" 
             style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="video-modal-content relative w-full max-w-4xl mx-auto p-4">
            <button 
              onClick={() => setSelectedClip(null)}
              className="video-modal-close absolute top-2 right-2 text-white bg-black px-3 py-1 z-10 hover:text-[#00f3ff]"
              style={{ textShadow: '0 0 8px rgba(0, 243, 255, 0.7)' }}
            >
              [CLOSE]
            </button>
            <div className="video-modal-player aspect-video w-full">
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
      
      <div className="relative z-10 min-h-screen" style={{ paddingTop: '0' }}>
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 bg-white z-50">
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
            <div className="flex items-center justify-center h-12">
              <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar">
                <NavButton href="/">HOME</NavButton>
                <NavButton href="/buy">HOW TO BUY</NavButton>
                <NavButton href="/roadmap">ROADMAP</NavButton>
                <NavButton href="/tokenomics">TOKENOMICS</NavButton>
                <NavButton href="/cast">CAST</NavButton>
                <NavButton href="/clips">CLIPS</NavButton>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Container */}
        <div className="template-container mx-auto px-4" style={{ 
          paddingTop: '3rem', 
          marginTop: '0',
          overflow: 'visible' 
        }}>
          <main className="template-content flex flex-col items-center" style={{ 
            overflow: 'visible',
            paddingTop: '0',
            marginTop: '0'
          }}>
            <div className="degenswim-title" style={{
              marginTop: '5rem',
              marginBottom: '2rem',
              position: 'relative',
              zIndex: 1
            }}>
              CLIPS
            </div>

            {/* Clips Grid - Replace with nicer container */}
            <div className="stream-window w-full max-w-5xl" style={{ 
              marginTop: '0',
              overflow: 'visible',
              position: 'relative',
              zIndex: 1
            }}>
              <div className="p-8" style={{ overflow: 'visible' }}>
                <div className="clips-card" style={{ 
                  overflow: 'visible',
                  minHeight: '500px',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  zIndex: 1,
                  padding: '3rem 2rem 2rem 2rem',
                  width: '90%',
                  margin: '0 auto'
                }}>
                  <div className="clips-content" style={{ overflow: 'visible' }}>
                    <h2 className="text-3xl font-bold mb-8 text-center text-white" style={{ 
                      textShadow: '0 0 15px rgba(0, 243, 255, 0.7)',
                      color: 'white'
                    }}>
                      Community Clips
                    </h2>
                    
                    {isClipsLoading ? (
                      <div className="text-center py-10">
                        <div className="loading-spinner">
                          <div className="spinner-circle"></div>
                        </div>
                      </div>
                    ) : clips.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {clips.map((clip, index) => (
                          <div 
                            key={clip.id} 
                            className="w-full cursor-pointer" 
                            onClick={() => handleClipClick(clip)}
                          >
                            <div className="aspect-video bg-black/30 rounded-lg overflow-hidden border-2 border-[#00f3ff]/30 hover:border-[#00f3ff] transition-all duration-300 group">
                              <img 
                                src={clip.thumbnailUrl || `https://image.mux.com/${clip.playbackId}/thumbnail.webp?time=1&width=240&height=135`}
                                alt={clip.title || `DegenSwim Stream ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  // Fallback for missing thumbnails
                                  e.currentTarget.src = `https://image.mux.com/${clip.playbackId}/thumbnail.webp?time=1&width=240&height=135`;
                                }}
                              />
                              <div className="absolute inset-0 bg-[#00f3ff]/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <h3 className="mt-2 text-white text-sm text-center" style={{
                              textShadow: '0 0 8px rgba(0, 243, 255, 0.5)',
                              color: 'white'
                            }}>
                              {clip.title || `DegenSwim Stream ${index + 1}`}
                            </h3>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="col-span-full text-center py-10">
                        <p className="text-gray-400">No clips yet. Be the first to create one!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white z-50 flex justify-center items-center">
          <div className="flex flex-wrap items-center justify-center h-12">
            <a href="https://twitter.com/degenswimtv" target="_blank" rel="noopener noreferrer" className="footer-button twitter-button">
              TWITTER
            </a>
            <a href="https://t.me/degenswimtv" target="_blank" rel="noopener noreferrer" className="footer-button telegram-button">
              TELEGRAM
            </a>
            <a href="https://discord.gg/degenswimtv" target="_blank" rel="noopener noreferrer" className="footer-button discord-button">
              DISCORD
            </a>
            <a href="https://www.youtube.com/@degenswimtv" target="_blank" rel="noopener noreferrer" className="footer-button youtube-button">
              YOUTUBE
            </a>
            <a href="https://twitch.tv/degenswimtv" target="_blank" rel="noopener noreferrer" className="footer-button twitch-button">
              TWITCH
            </a>
            <a href="https://dexscreener.com/solana/degenswim" target="_blank" rel="noopener noreferrer" className="footer-button dexscreener-button">
              DEXSCREENER
            </a>
            <a href="https://www.coingecko.com/en/coins/degenswim" target="_blank" rel="noopener noreferrer" className="footer-button coingecko-button">
              COINGECKO
            </a>
            <a href="https://www.tiktok.com/@degenswimtv" target="_blank" rel="noopener noreferrer" className="footer-button tiktok-button">
              TIKTOK
            </a>
            <span className="footer-button">
              © 2025 DEGENSWIM
            </span>
          </div>
        </footer>
      </div>
    </>
  );
} 