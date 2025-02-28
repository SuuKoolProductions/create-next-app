import Head from "next/head";
import CRTOverlay from '../components/Layout/CRTOverlay';
import BackgroundVideo from '../components/Layout/BackgroundVideo';
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";

interface RoadmapPhase {
  name: string;
  title: string;
  points: string[];
  image: string;
  position: 'left' | 'right';
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

export default function RoadmapPage() {
  const roadmapRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const roadmapPhases: RoadmapPhase[] = [
    {
      name: "Phase One",
      title: "Foundation and Launch",
      points: [
        "Develop core environments with props, textures, and diverse scene backgrounds.",
        "Implement a token system for topic requests with priority for higher spenders.",
        "Launch marketing targeting memes, crypto, and viral content.",
        "Secure DEX and CEX listings for wider exposure.",
        "Introduce themed scene variations (house, rocket launchpad, game show, etc.).",
        "Build community channels for memes, sharing, and feedback."
      ],
      image: "/images/roadmap/Phase1.png",
      position: "left"
    },
    {
      name: "Phase Two",
      title: "Expansion & Customization",
      points: [
        "Add new characters with unique traits and voices.",
        "Unlock exclusive scenes and props via events and token milestones.",
        "Launch token-powered community voting for new features.",
        "Reward top creators and viral memes with tokens.",
        "Collaborate with meme icons and crypto brands.",
        "Develop a clipping system linking wallets for voting and rewards.",
        "Introduce Partner Program that offers co-branded opportunities for ecosystem growth by locking tokens."
      ],
      image: "/images/roadmap/Phase2.png",
      position: "right"
    },
    {
      name: "Phase Three",
      title: "Innovation & Evolution",
      points: [
        "Introduce gamified engagement like challenges, leaderboards, and exclusive NFT rewards for active participants.",
        "Drive revenue streams to ensure community are rewarded for participation.",
        "Introduce an AI-powered VTuber with live-stream interaction.",
        "Shift to AI-generated animations for fresh storytelling.",
        "Experiment with AI-driven short stories, comics, and dynamic memes."
      ],
      image: "/images/roadmap/Phase3.png",
      position: "left"
    }
  ];

  const [timelineVisible, setTimelineVisible] = useState(false);

  useEffect(() => {
    roadmapRefs.current = roadmapRefs.current.slice(0, roadmapPhases.length);
  }, [roadmapPhases.length]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('cast-visible');
          }, 300);
        }
      });
    }, { 
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    });

    roadmapRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      roadmapRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  useEffect(() => {
    // Even longer delay for timeline to ensure all phases are fully loaded
    const totalAnimationTime = 1800; // Increased from 1600ms
    
    const timelineTimer = setTimeout(() => {
      setTimelineVisible(true);
    }, totalAnimationTime);
    
    return () => clearTimeout(timelineTimer);
  }, []);

  return (
    <>
      <Head>
        <title>Roadmap · DegenSwim</title>
      </Head>

      <audio id="hover-sound">
        <source src="/sounds/menu-hover.mp3" type="audio/mpeg" />
      </audio>
      <audio id="select-sound">
        <source src="/sounds/menu-select.mp3" type="audio/mpeg" />
      </audio>

      <canvas id="gridCanvas" className="fixed top-0 left-0 w-full h-full z-0" />
      <CRTOverlay />
      <BackgroundVideo />
      <div className="relative z-10 min-h-screen">
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

        <div className="container mx-auto px-4 pt-20" style={{ overflow: 'visible' }}>
          <main className="flex flex-col items-center" style={{ overflow: 'visible' }}>
            <div className="degenswim-title mt-32" style={{ 
              marginBottom: '100px',
              position: 'relative',
              zIndex: 2
            }}>
              ROADMAP
            </div>

            <div className="stream-window w-full max-w-5xl" style={{ 
              marginTop: '0',
              overflow: 'visible',
              position: 'relative',
              zIndex: 1
            }}>
              <div className="cast-timeline-container">
                <div 
                  className={`timeline-connector ${timelineVisible ? 'timeline-visible' : ''}`} 
                  style={{ 
                    height: `calc(100% - 200px)`,
                    background: 'linear-gradient(to bottom, rgba(0, 243, 255, 0.7), rgba(255, 0, 255, 0.7))',
                    left: 'calc(50% - 25px)',
                    zIndex: -1
                  }}
                ></div>

                {roadmapPhases.map((phase, index) => (
                  <div
                    key={phase.name}
                    ref={el => roadmapRefs.current[index] = el}
                    className={`cast-member ${phase.position}`}
                  >
                    <div className="cast-card" style={{ 
                      boxShadow: `0 0 20px rgba(${phase.position === 'left' ? '176, 38, 255' : '0, 243, 255'}, 0.3)`
                    }}>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 w-full md:w-48 h-48 relative overflow-hidden rounded-lg border-2 border-[#00f3ff]">
                          <div 
                            className="w-full h-full flex items-center justify-center bg-black bg-opacity-50 image-container"
                            style={{ 
                              boxShadow: `0 0 15px rgba(${phase.position === 'left' ? '176, 38, 255' : '0, 243, 255'}, 0.5)`,
                            }}
                          >
                            <img 
                              src={phase.image} 
                              alt={`${phase.name} illustration`}
                              className="relative"
                              style={{
                                width: '85%',
                                height: '85%',
                                objectFit: 'contain',
                                objectPosition: 'center',
                                zIndex: 1,
                                borderRadius: '4px'
                              }}
                              onError={(e) => {
                                console.error(`Failed to load image: ${phase.image}`);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold mb-1" style={{ 
                            color: 'white',
                            textShadow: `0 0 15px rgba(${phase.position === 'left' ? '255, 100, 255' : '30, 255, 255'}, 0.9)`,
                            filter: 'brightness(1.2)'
                          }}>
                            {phase.name}
                          </h2>
                          <h3 className="text-xl mb-4" style={{
                            color: 'white',
                            textShadow: `0 0 12px rgba(30, 255, 255, 0.9)`,
                            filter: 'brightness(1.2)'
                          }}>
                            {phase.title}
                          </h3>
                          
                          <ul className="space-y-3 list-disc pl-5">
                            {phase.points.map((point, pIndex) => (
                              <li key={pIndex} style={{
                                color: 'white',
                                textShadow: '0 0 2px rgba(255, 255, 255, 0.5)',
                                filter: 'brightness(1.1)',
                                lineHeight: '1.5'
                              }}>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>

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