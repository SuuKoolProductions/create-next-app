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
        <title>About Us · DegenSwim</title>
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
      <NoiseBackground opacity={0.5} blendMode="multiply" />
      
      <div className="relative z-10 min-h-screen">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 bg-white z-50 flex justify-center items-center">
          <div className="flex items-center h-12">
            <NavButton href="/">HOME</NavButton>
            <NavButton href="/aboutus">ABOUT US</NavButton>
            <NavButton href="/buy">HOW TO BUY</NavButton>
            <NavButton href="/roadmap">ROADMAP</NavButton>
            <NavButton href="/tokenomics">TOKENOMICS</NavButton>
            <NavButton href="/cast">CAST</NavButton>
            <NavButton href="/clips">CLIPS</NavButton>
          </div>
        </nav>

        {/* Main Content Container */}
        <div className="template-container mx-auto px-4" style={{ 
          paddingTop: '1rem', 
          marginTop: '0',
          overflow: 'visible' 
        }}>
          <main className="template-content flex flex-col items-center" style={{ 
            overflow: 'visible',
            paddingTop: '0',
            marginTop: '0'
          }}>
            <div className="degenswim-title" style={{
              marginTop: '4rem',
              marginBottom: '2rem',
              position: 'relative',
              zIndex: 1
            }}>
              ABOUT US
            </div>

            {/* About Us Content */}
            <div style={{ 
              width: '75%',
              maxWidth: '75%',
              margin: '0 auto',
              overflow: 'visible',
              position: 'relative',
              zIndex: 1,
              paddingBottom: '6rem'
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
                  {/* Introduction */}
                  <p className="text-xl mb-8" style={{ 
                    color: 'white',
                    textShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
                    lineHeight: '1.7'
                  }}>
                    <span className="text-3xl font-bold" style={{ 
                      color: 'white',
                      textShadow: '0 0 15px rgba(0, 243, 255, 0.9)'
                    }}>
                      [degen swim]
                    </span> isn't just a show—it's an unhinged, ever-evolving AI entertainment network built to break every rule of traditional content. We're not here to play it safe. We're here to push the boundaries of Web3 entertainment with wild, unpredictable, community-driven chaos.
                  </p>

                  {/* How We Differentiate */}
                  <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-4" style={{ 
                      color: 'white',
                      textShadow: '0 0 15px rgba(255, 100, 255, 0.8)'
                    }}>
                      How Do We Differentiate From Others?
                    </h2>
                    <p style={{ 
                      color: 'white',
                      lineHeight: '1.7',
                      textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                    }}>
                      We're not scripted. We're not static. We're zany, ever-changing, and shaped by the community. One moment, you're watching a hyper-realistic AI-generated degen drama. The next? A meme-fueled fever dream starring pixelated penguins fighting over a rug-pulled treasury.
                    </p>
                  </div>

                  {/* How We Deliver Content */}
                  <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-4" style={{ 
                      color: 'white',
                      textShadow: '0 0 15px rgba(0, 243, 255, 0.8)'
                    }}>
                      How Do We Deliver Content Differently?
                    </h2>
                    <ul className="space-y-4">
                      <li style={{ 
                        color: 'white',
                        lineHeight: '1.7',
                        textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                      }}>
                        <span className="font-bold" style={{ textShadow: '0 0 8px rgba(30, 255, 255, 0.6)' }}>Multiple Channels, Infinite Styles</span> – We start as one nonstop stream, but the vision expands into multiple AI-powered channels where you choose your vibe. Hyper-realistic? Meme-core? A chaotic mix of both? Your call.
                      </li>
                      <li style={{ 
                        color: 'white',
                        lineHeight: '1.7',
                        textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                      }}>
                        <span className="font-bold" style={{ textShadow: '0 0 8px rgba(30, 255, 255, 0.6)' }}>Live AI Characters</span> – 1:1 interactive AI characters that stream, react, and roast you in real time. It's content that talks back.
                      </li>
                      <li style={{ 
                        color: 'white',
                        lineHeight: '1.7',
                        textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                      }}>
                        <span className="font-bold" style={{ textShadow: '0 0 8px rgba(30, 255, 255, 0.6)' }}>User-Created Shows</span> – The community pitches ideas, votes, and the best shows get added to the network, baked into the lore, and rewarded with tokenized incentives.
                      </li>
                      <li style={{ 
                        color: 'white',
                        lineHeight: '1.7',
                        textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                      }}>
                        <span className="font-bold" style={{ textShadow: '0 0 8px rgba(30, 255, 255, 0.6)' }}>Different Mediums, Different Workflows</span> – We're not tied to one platform. Unity, Unreal, AI-generated animations, live streaming, whatever works. Each workflow unlocks a new style of content, meaning [degen swim] never stops evolving.
                      </li>
                    </ul>
                  </div>

                  {/* Why It's Built Different */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4" style={{ 
                      color: 'white',
                      textShadow: '0 0 15px rgba(255, 100, 255, 0.8)'
                    }}>
                      Why It's Built Different
                    </h2>
                    <p style={{ 
                      color: 'white',
                      lineHeight: '1.7',
                      textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                    }}>
                      We're not just here to entertain—we're here to build a network that fuels itself. Creators get paid. Tokens get burned. The network grows with every new show, character, and community-driven idea. The more unhinged it gets, the bigger it becomes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white z-50 flex justify-center items-center">
          <div className="flex items-center h-12">
            <a href="https://twitter.com/degenswim" target="_blank" rel="noopener noreferrer" className="footer-button">
              TWITTER
            </a>
            <a href="https://t.me/degenswim" target="_blank" rel="noopener noreferrer" className="footer-button">
              TELEGRAM
            </a>
            <a href="https://discord.gg/degenswim" target="_blank" rel="noopener noreferrer" className="footer-button">
              DISCORD
            </a>
            <a href="https://www.youtube.com/@degenswim" target="_blank" rel="noopener noreferrer" className="footer-button youtube-button">
              YOUTUBE
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