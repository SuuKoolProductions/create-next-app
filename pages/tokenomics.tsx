import Head from "next/head";
import CRTOverlay from '../components/Layout/CRTOverlay';
import BackgroundVideo from '../components/Layout/BackgroundVideo';
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

const TokenDistributionPie = () => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  
  const segments = [
    { name: 'Team', percentage: 17.5, color: '#FFA500' },
    { name: 'Agentic Enjoyers Reward Pool', percentage: 20, color: '#76ff03' },
    { name: 'Holder Reward Pool', percentage: 20, color: '#b026ff' },
    { name: 'Creator Reward Pool', percentage: 10, color: '#ffeb3b' },
    { name: 'Liquidity', percentage: 10, color: '#ff1493' },
    { name: 'Private Sale', percentage: 10, color: '#ff0000' },
    { name: 'Public Sale', percentage: 12.5, color: '#00ffff' }
  ];

  // Calculate SVG pie segments
  const calculateSVGPath = (startAngle: number, endAngle: number, radius: number) => {
    // Center the chart within the SVG viewBox
    const centerX = 260;
    const centerY = 260;
    
    const start = {
      x: centerX + radius * Math.cos((startAngle - 90) * (Math.PI / 180)),
      y: centerY + radius * Math.sin((startAngle - 90) * (Math.PI / 180))
    };
    
    const end = {
      x: centerX + radius * Math.cos((endAngle - 90) * (Math.PI / 180)),
      y: centerY + radius * Math.sin((endAngle - 90) * (Math.PI / 180))
    };
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  // Add this helper function after the calculateSVGPath function
  const calculateSegmentTransform = (startAngle: number, endAngle: number) => {
    // Calculate the midpoint angle of the segment
    const midpointAngle = (startAngle + endAngle) / 2;
    
    // Calculate the direction vector (where the segment should move)
    const radians = (midpointAngle - 90) * (Math.PI / 180);
    
    // Calculate offset distance (how far the segment should move)
    const distance = 20; // pixels to move outward
    
    const translateX = distance * Math.cos(radians);
    const translateY = distance * Math.sin(radians);
    
    return { translateX, translateY, midpointAngle };
  };

  // Generate pie slices
  let currentAngle = 0;
  const svgPaths = segments.map(segment => {
    const startAngle = currentAngle;
    const sliceAngle = segment.percentage * 3.6;
    currentAngle += sliceAngle;
    const endAngle = currentAngle;
    
    // Add transform data to each segment
    const transform = calculateSegmentTransform(startAngle, endAngle);
    
    return {
      ...segment,
      path: calculateSVGPath(startAngle, endAngle, 200),
      startAngle,
      endAngle,
      transform
    };
  });

  // Render all segments except the hovered one first
  const renderSegments = () => {
    // First render all non-hovered segments
    const normalSegments = svgPaths.map((segment, index) => {
      if (hoveredIndex === index) return null;
      
      return (
        <path
          key={segment.name}
          d={segment.path}
          fill={segment.color}
          filter={`url(#glow-${index})`}
          opacity="0.9"
          stroke="#000"
          strokeWidth="1"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className="pie-segment"
          style={{
            transformOrigin: '260px 260px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <title>{segment.name} - {segment.percentage}%</title>
        </path>
      );
    });
    
    // Then render the hovered segment last so it's on top
    const hoveredSegment = hoveredIndex !== null && hoveredIndex < svgPaths.length ? (
      <path
        key={svgPaths[hoveredIndex]?.name + "-hovered"}
        d={svgPaths[hoveredIndex]?.path || ""}
        fill={svgPaths[hoveredIndex]?.color || "#ccc"}
        filter={`url(#glow-${hoveredIndex})`}
        opacity="0.9"
        stroke="#000"
        strokeWidth="1"
        onMouseEnter={() => setHoveredIndex(hoveredIndex)}
        onMouseLeave={() => setHoveredIndex(null)}
        className="pie-segment"
        style={{
          transformOrigin: '260px 260px',
          cursor: 'pointer',
          transform: `translate(${svgPaths[hoveredIndex]?.transform?.translateX || 0}px, ${svgPaths[hoveredIndex]?.transform?.translateY || 0}px) scale(1.05)`,
          filter: `brightness(1.4) drop-shadow(0 0 25px ${svgPaths[hoveredIndex]?.color || "#ccc"})`,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <title>{svgPaths[hoveredIndex]?.name || ""} - {svgPaths[hoveredIndex]?.percentage || 0}%</title>
      </path>
    ) : null;
    
    return [...normalSegments, hoveredSegment];
  };

  return (
    <div className="pie-chart-wrapper">
      <div className="pie-chart-container">
        <svg 
          viewBox="0 0 520 520" 
          className="w-full h-full drop-shadow-2xl"
        >
          <defs>
            {segments.map((segment, index) => (
              <filter key={`filter-${index}`} id={`glow-${index}`}>
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor={segment.color} result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>
          
          {renderSegments()}
        </svg>
      </div>

      <div className="token-distribution-legend">
        {segments.map((segment, index) => (
          <div 
            key={segment.name} 
            className="token-legend-item"
            style={{ 
              borderColor: segment.color,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div 
              className="token-legend-color"
              style={{ 
                backgroundColor: segment.color,
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                flexShrink: 0,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                transform: hoveredIndex === index ? 'scale(1.25)' : 'scale(1)',
                boxShadow: hoveredIndex === index ? `0 0 12px 2px ${segment.color}` : 'none'
              }}
            />
            <span 
              className="token-legend-text"
              style={{
                fontWeight: hoveredIndex === index ? 'bold' : 'normal',
                color: hoveredIndex === index ? segment.color : 'white',
                transition: 'color 0.3s ease, font-weight 0.3s ease'
              }}
            >
              {segment.name} - {segment.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Tokenomics() {
  return (
    <>
      <Head>
        <title>Tokenomics · DegenSwim</title>
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
              TOKENOMICS
            </div>

            <div className="stream-window w-full max-w-5xl" style={{ 
              marginTop: '0',
              overflow: 'visible',
              position: 'relative',
              zIndex: 1
            }}>
              <div className="p-8" style={{ overflow: 'visible' }}>
                <div className="tokenomics-card" style={{ 
                  overflow: 'hidden !important',
                  minHeight: '500px',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  zIndex: 1,
                  padding: '3rem 2rem 2rem 2rem',
                  width: '100%',
                  margin: '0 auto',
                  boxSizing: 'border-box'
                }}>
                  <div className="tokenomics-content" style={{ overflow: 'visible' }}>
                    <h2 className="text-3xl font-bold mb-8 text-center text-white" style={{ 
                      textShadow: '0 0 15px rgba(0, 243, 255, 0.7)',
                      color: 'white'
                    }}>
                      Token Distribution
                    </h2>
                    <TokenDistributionPie />

 {/* Agentic Enjoyers explanation */}
 <div className="mt-10 p-4 rounded-lg bg-black bg-opacity-60 border border-[rgba(0,243,255,0.3)]">
                      <h3 className="text-xl font-bold mb-3" style={{ 
                        color: 'white',
                        textShadow: '0 0 10px rgba(255, 100, 255, 0.8)'
                      }}>
                        Agentic Enjoyers =
                      </h3>
                      <ul className="space-y-2 list-disc pl-5">
                        <li style={{ color: 'white', textShadow: '0 0 2px rgba(255, 255, 255, 0.5)' }}>
                          Community members who actively spread awareness (e.g., social media engagement, referrals)
                        </li>
                        <li style={{ color: 'white', textShadow: '0 0 2px rgba(255, 255, 255, 0.5)' }}>
                          Contributors who help grow the ecosystem (e.g., developers, testers, content creators)
                        </li>
                        <li style={{ color: 'white', textShadow: '0 0 2px rgba(255, 255, 255, 0.5)' }}>
                          Early adopters who show loyalty and participation (e.g., using the platform, holding tokens)
                        </li>
                      </ul>
                    </div>

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

      <style jsx>{`
        .footer-button {
          display: inline-block;
          padding: 0 15px;
          font-family: 'VT323', monospace;
          font-size: 16px;
          line-height: 48px;
          text-transform: uppercase;
          cursor: pointer;
          color: white;
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
    </>
  );
} 