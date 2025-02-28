import Portal from "../components/graphics/portal";
import { usePrivy } from '@privy-io/react-auth';
import { PrivyClient } from "@privy-io/server-auth";
import { GetServerSideProps } from "next";
import Head from "next/head";
import CRTOverlay from '../components/Layout/CRTOverlay';
import BackgroundVideo from '../components/Layout/BackgroundVideo';
import Navigation from '../components/Navigation/Navigation';
import { useRouter } from "next/router";
import MuxPlayer from "@mux/mux-player-react";
import LoadingOverlay from '../components/LoadingOverlay/LoadingOverlay';
import React, { useState, useEffect } from 'react';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { PublicKey, Transaction, Connection, clusterApiUrl } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from '@solana/spl-token';

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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookieAuthToken = req.cookies["privy-token"];

  // If no cookie is found, skip any further checks
  if (!cookieAuthToken) return { props: {} };

  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
  const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

  try {
    const claims = await client.verifyAuthToken(cookieAuthToken);
    // Simply return props without redirect
    return { props: {} };
  } catch (error) {
    return { props: {} };
  }
};

interface ClipTimes {
  startTime: number | null;
  endTime: number | null;
}
export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [showClipControls, setShowClipControls] = useState(false);
  const [clipTimes, setClipTimes] = useState<ClipTimes>({
    startTime: null,
    endTime: null
  });
  const [isClipping, setIsClipping] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [topic, setTopic] = useState('');
  const [txSignature, setTxSignature] = useState('');
  const [fontSize, setFontSize] = useState('3rem');
  const [priorityTopics, setPriorityTopics] = useState([]);

  const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

  useEffect(() => {
    // This only runs on the client after hydration
    setFontSize(window.innerWidth < 480 ? '2rem' : '3rem');
    
    const handleResize = () => {
      setFontSize(window.innerWidth < 480 ? '2rem' : '3rem');
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/get-topics');
        if (response.ok) {
          const data = await response.json();
          setPriorityTopics(data.slice(0, 5)); // Get top 5 priority topics
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
    const interval = setInterval(fetchTopics, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleInitialize = () => {
    // Pre-load audio
    const hoverSound = document.getElementById('hover-sound') as HTMLAudioElement;
    const selectSound = document.getElementById('select-sound') as HTMLAudioElement;
    
    // Try to play and immediately pause to initialize audio context
    Promise.all([
      hoverSound.play().then(() => hoverSound.pause()),
      selectSound.play().then(() => selectSound.pause())
    ]).catch(console.error);

    setIsLoading(false);
  };

  const handleClipIn = () => {
    const player = document.querySelector('mux-player') as any;
    if (player) {
      const currentTime = player.currentTime;
      setClipTimes(prev => ({
        ...prev,
        startTime: currentTime
      }));
      setDebugInfo(prev => prev + `\nClip In Time: ${currentTime}`);
      console.log('Clip In Time:', currentTime);
    }
  };

  const handleClipOut = () => {
    const player = document.querySelector('mux-player') as any;
    if (player) {
      const currentTime = player.currentTime;
      setClipTimes(prev => ({
        ...prev,
        endTime: currentTime
      }));
      setDebugInfo(prev => prev + `\nClip Out Time: ${currentTime}`);
      console.log('Clip Out Time:', currentTime);
    }
  };

  const handleSubmitClip = async () => {
    if (!clipTimes.startTime || !clipTimes.endTime) return;
    
    setIsClipping(true);
    console.log('Submitting clip with times:', clipTimes);
    setDebugInfo(prev => prev + '\nSubmitting clip...');

    try {
      const payload = {
        playbackId: "XvEruTdTzl8Jtmp5erTDam5nK31KhgRQaRSYoAUmnCg",
        startTime: clipTimes.startTime,
        endTime: clipTimes.endTime
      };
      console.log('Request payload:', payload);
      setDebugInfo(prev => prev + `\nPayload: ${JSON.stringify(payload)}`);

      const response = await fetch('/api/clips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('API Response:', data);
      setDebugInfo(prev => prev + `\nAPI Response: ${JSON.stringify(data)}`);

      if (!response.ok) {
        throw new Error(`Failed to create clip: ${data.message || 'Unknown error'}`);
      }

      setShowClipControls(false);
      setClipTimes({ startTime: null, endTime: null });
      setDebugInfo('Clip created successfully!');
    } catch (error: any) {
      console.error('Error creating clip:', error);
      setDebugInfo(prev => prev + `\nError: ${error.message}`);
    } finally {
      setIsClipping(false);
    }
  };

  const handleLogin = () => {
    login({
      loginMethods: ['wallet'],
    });
  };

  const sendSolanaTransaction = async () => {
    try {
      const wallet = wallets[0];
      if (!wallet || !topic) return;

      const connection = new Connection(clusterApiUrl('devnet'));
      
      const params = {
        senderPublicKey: new PublicKey(wallet.address),
        recipientAddress: new PublicKey("DQFL1TuaDDTYVPKLk1QNTWTcYUV9JynxpSjTy2y7bXiJ"),
        tokenMint: new PublicKey("mntJQeeYTGFuxm1tUBmLNVZzNHEsasddX5nK6SXmBQr"),
        amount: BigInt(100 * (10 ** 9)),
      };

      const senderTokenAccount = await getAssociatedTokenAddress(
        params.tokenMint,
        params.senderPublicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const recipientTokenAccount = await getAssociatedTokenAddress(
        params.tokenMint,
        params.recipientAddress,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      const transaction = new Transaction();

      const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
      if (!recipientAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            params.senderPublicKey,
            recipientTokenAccount,
            params.recipientAddress,
            params.tokenMint,
            TOKEN_2022_PROGRAM_ID
          )
        );
      }

      transaction.add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          params.senderPublicKey,
          Number(params.amount),
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      transaction.feePayer = params.senderPublicKey;
      transaction.recentBlockhash = blockhash;

      const signature = await wallet.sendTransaction(transaction, connection);
      setTxSignature(signature);

      // Submit topic to API
      await fetch('/api/submit-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature, topic }),
      });

      setTopic('');

    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Home · DegenSwim</title>
      </Head>

      <audio id="hover-sound">
        <source src="/sounds/menu-hover.mp3" type="audio/mpeg" />
      </audio>
      <audio id="select-sound">
        <source src="/sounds/menu-select.mp3" type="audio/mpeg" />
      </audio>

      <LoadingOverlay 
        isVisible={isLoading} 
        onInitialize={handleInitialize} 
      />

      <canvas id="gridCanvas" className="fixed top-0 left-0 w-full h-full z-0" />
      <CRTOverlay />
      <BackgroundVideo />
      
      <div className="relative z-10 min-h-screen">
        <nav className="fixed top-0 left-0 right-0 bg-white z-50">
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
            <div className="flex items-center justify-center h-12">
              <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar">
                <NavButton href="/buy">HOW TO BUY</NavButton>
                <NavButton href="/roadmap">ROADMAP</NavButton>
                <NavButton href="/tokenomics">TOKENOMICS</NavButton>
                <NavButton href="/cast">CAST</NavButton>
                <NavButton href="/clips">CLIPS</NavButton>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 pt-20">
          <main className="flex flex-col items-center">
            <div className="degenswim-title mt-32">
              [degen swim]
            </div>

            <div className="social-buttons-container">
              <SocialButton href="https://twitter.com/degenswimtv" color="twitter">X</SocialButton>
              <SocialButton href="https://t.me/degenswimtv" color="telegram">TELEGRAM</SocialButton>
              <SocialButton href="https://discord.gg/degenswimtv" color="discord">DISCORD</SocialButton>
              <SocialButton href="https://www.youtube.com/@degenswimtv" color="youtube">YOUTUBE</SocialButton>
              <SocialButton href="https://twitch.tv/degenswimtv" color="twitch">TWITCH</SocialButton>
              <SocialButton href="https://dexscreener.com/solana/degenswim" color="dexscreener">DEXSCREENER</SocialButton>
              <SocialButton href="https://www.coingecko.com/en/coins/degenswim" color="coingecko">COINGECKO</SocialButton>
              <SocialButton href="https://www.tiktok.com/@degenswimtv" color="tiktok">TIKTOK</SocialButton>
            </div>

            <div className="mt-8 mb-12 w-full flex justify-center">
              <div className="buy-now-container">
                <button className="glitch-button buy-now-button">
                  <div className="relative">
                    <div className="green-item-stroke">BUY NOW</div>
                    <div className="green-item-no-stroke">BUY NOW</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="video-glow">
              <div className="aspect-video relative">
                <MuxPlayer
                  playbackId="XvEruTdTzl8Jtmp5erTDam5nK31KhgRQaRSYoAUmnCg"
                  metadataVideoTitle="DEGENSWIM"
                  metadata-viewer-user-id="ONLY ON DEGENSWIM"
                  primary-color="#ffffff"
                  secondary-color="#000000"
                  accent-color="#fa50b5"
                  autoPlay={false}
                  muted={false}
                  thumbnailTime={5}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              <div className="video-controls">
                {!showClipControls ? (
                  <button
                    onClick={() => setShowClipControls(true)}
                    className="glitch-button clip-button"
                  >
                    <div className="relative">
                      <div className="blue-item-stroke">CLIP IT!</div>
                      <div className="blue-item-no-stroke">CLIP IT!</div>
                    </div>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleClipIn}
                      disabled={isClipping}
                      className="glitch-button vertical small"
                    >
                      <div className="relative">
                        <div className="blue-item-stroke">CLIP IN</div>
                        <div className="blue-item-no-stroke">CLIP IN</div>
                      </div>
                    </button>
                    <button
                      onClick={handleClipOut}
                      disabled={isClipping || !clipTimes.startTime}
                      className="glitch-button vertical small"
                    >
                      <div className="relative">
                        <div className="blue-item-stroke">CLIP OUT</div>
                        <div className="blue-item-no-stroke">CLIP OUT</div>
                      </div>
                    </button>
                    <button
                      onClick={handleSubmitClip}
                      disabled={isClipping || !clipTimes.startTime || !clipTimes.endTime}
                      className="glitch-button vertical small"
                    >
                      <div className="relative">
                        <div className="blue-item-stroke">SUBMIT</div>
                        <div className="blue-item-no-stroke">SUBMIT</div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="form-glow">
              <div className="submission-container">
                {!authenticated ? (
                  <button 
                    className="glitch-button green" 
                    onClick={handleLogin}
                    style={{ width: '300px' }}
                  >
                    <div className="relative">
                      <div className="green-item-stroke">CONNECT WALLET</div>
                      <div className="green-item-no-stroke">CONNECT WALLET</div>
                    </div>
                  </button>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Priority Topic - 100 DEGENSWIM"
                      className="topic-input"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                    <button 
                      className="glitch-button" 
                      onClick={sendSolanaTransaction}
                      disabled={!topic}
                      style={{ width: '120px' }}
                    >
                      <div className="relative">
                        <div className="green-item-stroke">SUBMIT</div>
                        <div className="green-item-no-stroke">SUBMIT</div>
                      </div>
                    </button>
                    <button 
                      className="glitch-button red" 
                      onClick={logout}
                      style={{ width: '120px' }}
                    >
                      <div className="relative">
                        <div className="red-item-stroke">DISCONNECT</div>
                        <div className="red-item-no-stroke">DISCONNECT</div>
                      </div>
                    </button>
                    {txSignature && (
                      <div className="mt-2 text-[#00f3ff] text-xs">
                        Transaction: {txSignature.slice(0, 6)}...{txSignature.slice(-4)}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* New Priority Topic Queue Display */}
            <div className="priority-queue-container" style={{
              width: '100%',
              maxWidth: '800px',
              margin: '2rem auto',
              padding: '1rem',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.5rem',
              boxShadow: '0 0 20px rgba(0, 243, 255, 0.3)'
            }}>
              <h2 className="text-xl font-bold mb-4" style={{ 
                color: 'white',
                textAlign: 'center',
                textShadow: '0 0 15px rgba(0, 243, 255, 0.8)'
              }}>
                PRIORITY TOPIC QUEUE
              </h2>
              
              <div className="topic-list">
                {priorityTopics.length > 0 ? (
                  priorityTopics.map((topic: any, index: number) => {
                    // Define color based on position in queue
                    const colors = ['#76ff03', '#b026ff', '#00f3ff', '#ffeb3b', '#ff1493'];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={topic.signature} className="topic-item" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        marginBottom: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderLeft: `4px solid ${color}`,
                        borderRadius: '0.25rem'
                      }}>
                        <div className="topic-content" style={{ color: 'white' }}>
                          <span className="font-bold">{topic.topic}</span>
                          <span className="text-sm ml-3 opacity-75" style={{ 
                            display: 'inline-block', 
                            borderLeft: '1px solid rgba(255,255,255,0.2)',
                            paddingLeft: '8px',
                            marginLeft: '8px'
                          }}>
                            by {topic.sender.slice(0, 4)}...{topic.sender.slice(-4)}
                          </span>
                        </div>
                        <div className="topic-status" style={{ 
                          color: color, 
                          fontWeight: 'bold',
                          textShadow: index === 0 ? `0 0 8px rgba(118, 255, 3, 0.6)` : 'none'
                        }}>
                          {index === 0 ? 'NEXT' : `#${index + 1}`}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: 'white', textAlign: 'center', padding: '1rem' }}>
                    No topics in queue. Be the first to submit one!
                  </div>
                )}
              </div>
            </div>

            <div className="degenswim-title about-us-title" style={{
              marginTop: '4rem',
              marginBottom: '2rem',
              position: 'relative',
              zIndex: 1,
              fontSize: fontSize,
              textAlign: 'center'
            }}>
              ABOUT US
            </div>
            
            <div style={{
              width: '100%',
              maxWidth: '800px',
              margin: '0 auto',
              padding: '0 1rem',
              boxSizing: 'border-box',
              overflowX: 'hidden'
            }}>
              <div style={{ 
                overflow: 'hidden',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                position: 'relative',
                zIndex: 1,
                borderRadius: '0.5rem',
                boxShadow: '0 0 30px rgba(0, 243, 255, 0.3)',
                marginTop: '1rem',
                marginBottom: '6rem'
              }} className="about-us-card">
                <p className="text-xl mb-6" style={{ 
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

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2" style={{ 
                    color: 'white',
                    textShadow: '0 0 15px rgba(255, 100, 255, 0.8)'
                  }}>
                    How Do We Differentiate From Others?
                  </h2>
                  <p style={{ 
                    color: 'white',
                    lineHeight: '1.6',
                    textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                  }}>
                    We're not scripted. We're not static. We're zany, ever-changing, and shaped by the community. One moment, you're watching a hyper-realistic AI-generated degen drama. The next? A meme-fueled fever dream starring pixelated penguins fighting over a rug-pulled treasury.
                  </p>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2" style={{ 
                    color: 'white',
                    textShadow: '0 0 15px rgba(0, 243, 255, 0.8)'
                  }}>
                    How Do We Deliver Content Differently?
                  </h2>
                  <ul className="space-y-2">
                    <li style={{ 
                      color: 'white',
                      lineHeight: '1.6',
                      textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                    }}>
                      <span className="font-bold" style={{ textShadow: '0 0 8px rgba(30, 255, 255, 0.6)' }}>Multiple Channels, Infinite Styles</span> – We start as one nonstop stream, but the vision expands into multiple AI-powered channels where you choose your vibe.
                    </li>
                    <li style={{ 
                      color: 'white',
                      lineHeight: '1.6',
                      textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                    }}>
                      <span className="font-bold" style={{ textShadow: '0 0 8px rgba(30, 255, 255, 0.6)' }}>Live AI Characters</span> – 1:1 interactive AI characters that stream, react, and roast you in real time.
                    </li>
                    <li style={{ 
                      color: 'white',
                      lineHeight: '1.6',
                      textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                    }}>
                      <span className="font-bold" style={{ textShadow: '0 0 8px rgba(30, 255, 255, 0.6)' }}>User-Created Shows</span> – The community pitches ideas, votes, and the best shows get added to the network.
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-2" style={{ 
                    color: 'white',
                    textShadow: '0 0 15px rgba(255, 100, 255, 0.8)'
                  }}>
                    Why It's Built Different
                  </h2>
                  <p style={{ 
                    color: 'white',
                    lineHeight: '1.6',
                    textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
                  }}>
                    We're not just here to entertain—we're here to build a network that fuels itself. Creators get paid. Tokens get burned. The network grows with every new show, character, and community-driven idea.
                  </p>
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

const SocialButton = ({ href, children, color }: { href: string; children: React.ReactNode; color: string }) => (
  <a 
    href={href} 
    className={`social-button social-button-${color}`} 
    target="_blank" 
    rel="noopener noreferrer"
  >
    <div className="relative">
      <div className="text-white">{children}</div>
    </div>
  </a>
);
