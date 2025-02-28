import Head from "next/head";
import CRTOverlay from '../components/Layout/CRTOverlay';
import BackgroundVideo from '../components/Layout/BackgroundVideo';
import NoiseBackground from '../components/Layout/NoiseBackground';
import { useRouter } from "next/router";
import React from "react";

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

export default function AboutUsPage() {
  return (
    <>
      <Head>
        <title>How To Buy · DegenSwim</title>
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
              HOW TO BUY
            </div>

            <div className="stream-window w-full max-w-5xl" style={{ 
              marginTop: '0',
              overflow: 'visible',
              position: 'relative',
              zIndex: 1
            }}>
              <div className="p-8" style={{ overflow: 'visible' }}>
                <div className="about-us-card" style={{ 
                  overflow: 'visible',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  zIndex: 1,
                  padding: '2.5rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 0 30px rgba(0, 243, 255, 0.3)'
                }}>
              

                  {/* Contract Address*/}
                  <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-4" style={{ 
                      color: 'white',
                      textShadow: '0 0 15px rgba(255, 100, 255, 0.8)'
                    }}>
                      Contract Address
                    </h2>
                    <p style={{ 
                      color: 'white',
                      lineHeight: '1.7',
                      textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                    }}>
                      mntJQeeYTGFuxm1tUBmLNVZzNHEsasddX5nK6SXmBQr
                    </p>
                  </div>

                  {/* How To Buy */}
                  <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-4" style={{ 
                      color: 'white',
                      textShadow: '0 0 15px rgba(0, 243, 255, 0.8)'
                    }}>
                      How Do You Buy DegenSwim?
                    </h2>
                    <ul className="space-y-4">
                      <li style={{ 
                        color: 'white',
                        lineHeight: '1.7',
                        textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                      }}>
                        <span className="font-bold" style={{ textShadow: '0 0 8px rgba(30, 255, 255, 0.6)' }}>On X</span> – Buy on X.
                      </li>
                      <li style={{ 
                        color: 'white',
                        lineHeight: '1.7',
                        textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                      }}>
                        <span className="font-bold" style={{ textShadow: '0 0 8px rgba(30, 255, 255, 0.6)' }}>On Dex</span> – Listed on Multiple Exchanges.</li>
                      <li style={{ 
                        color: 'white',
                        lineHeight: '1.7',
                        textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                      }}>
                        <span className="font-bold" style={{ textShadow: '0 0 8px rgba(30, 255, 255, 0.6)' }}>On Moonshot</span> – Buy Directly on the app store, with moonshot.
                      </li>
                      <li style={{ 
                        color: 'white',
                        lineHeight: '1.7',
                        textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                      }}>
                        <span className="font-bold" style={{ textShadow: '0 0 8px rgba(30, 255, 255, 0.6)' }}>With Fiat</span> – Buy with fiat, or with a debit or credit card.
                      </li>
                    </ul>
                  </div>

                  {/* Why It's Built Different */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4" style={{ 
                      color: 'white',
                      textShadow: '0 0 15px rgba(255, 100, 255, 0.8)'
                    }}>
                      Placeholder
                    </h2>
                    <p style={{ 
                      color: 'white',
                      lineHeight: '1.7',
                      textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                    }}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>
                </div>
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