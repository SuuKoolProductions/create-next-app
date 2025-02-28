import Head from "next/head";
import CRTOverlay from '../components/Layout/CRTOverlay';
import BackgroundVideo from '../components/Layout/BackgroundVideo';
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";
import LoadingOverlay from '../components/LoadingOverlay/LoadingOverlay';

interface CastMember {
  name: string;
  role: string;
  description: string[];
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

export default function CastPage() {
  const [isLoading, setIsLoading] = useState(true);
  const castRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const castMembers: CastMember[] = [
    {
      name: "Ledger Larry",
      role: "DAD",
      description: [
        "A stubborn, overconfident crypto OG who swears he's seen it all but still makes reckless decisions. He loves talking about \"XRP hitting $1000\" while riding his latest degen bet into the ground.",
        "He YOLOs into meme coin derivs constantly with no research and is always pestering the Telegram chat with stuff like \"HODL or die!\" He refuses to sell and thinks every dip is the bottom, even when his bags have been down 99% for months.",
        "Larry ran up his port on meme coins only to lose his private key, essentially locking the tokens forever. He once had a life-changing portfolio but got liquidated trying to \"long the bottom\" with max leverage. His MetaMask is a graveyard of rugs, yet he still thinks the next one will make him rich. Somehow, despite all this, he remains eternally bullish."
      ],
      image: "/images/cast/larry.png",
      position: "left"
    },
    {
      name: "Molly Meta",
      role: "MOM",
      description: [
        "The secret genius of the family. A DeFi queen who makes passive income but lets Larry think he's in charge. She's calm, collected, and always has a strategy.",
        "Made an absolute bag back in 2021 and somehow out-traded 90% of CT during the bear. While everyone else panic-sold, she was quietly farming, staking, and accumulating. Molly's wallets are always getting pinged on Whale Watch, and she loves watching the family react without knowing it's her.",
        "Her favorite thing to do in crypto is yield farm, stake tokens, and play the long game. She has spreadsheets tracking every protocol she's in, multiple cold wallets, and a portfolio so optimized it looks like it was managed by an AI. For a while now, she's secretly bankrolled the family with gains while calling Larry's trading style \"emotional.\" She lets him think he's the alpha, but in reality, she's the only one actually making money."
      ],
      image: "/images/cast/Molly.png",
      position: "right"
    },
    {
      name: "NFT Nate",
      role: "SON",
      description: [
        "A full-time NFT degen who thinks every pixelated animal PFP is the next Bored Ape. Nate spends his days sniping 'undervalued' jpegs, grinding Discord whitelist spots, and flexing on Twitter when floor prices go up 10%.",
        "He once sold a rare NFT for a 2x, only to watch it 100x a week later—he still hasn't recovered. Despite getting burned on every hyped mint, he swears he's \"one flip away\" from generational wealth. His entire MetaMask is filled with rugged projects, but he refuses to let go of his \"future grails.\"",
        "Nate has a love-hate relationship with OpenSea and blames 'paper-handed normies' every time a collection tanks. His dream is to secure a CryptoPunk, but for now, he settles for minting dog-themed knockoffs and coping in Twitter Spaces."
      ],
      image: "/images/cast/nate.png",
      position: "left"
    },
    {
      name: "Shelly Shill",
      role: "DAUGHTER",
      description: [
        "A TikTok crypto 'guru' who pumps meme coins to her followers with phrases like \"this one's about to send 🚀🚀.\" Shelly shills anything with a cute mascot and a supply of 69 trillion, then disappears when the chart does a full round trip.",
        "Claims she has no idea why her calls always dump but somehow always sells the top. Regularly posts 'success stories' of 'early investors' who made millions, while Larry and Nate are left bag-holding her latest pick.",
        "She's got every influencer marketing trick in the book—hyped-up videos, fake screenshots, and \"not financial advice\" disclaimers that somehow still get people rekt. Despite the chaos, she's always got a new project ready to pump, because, as she puts it, \"the next 100x is just one viral video away.\""
      ],
      image: "/images/cast/shelly.png",
      position: "right"
    },
    {
      name: "Hide the Pain Harold",
      role: "GRANDPA",
      description: [
        "A boomer investor who 'doesn't understand crypto' but was actually early to Bitcoin and is sitting on a life-changing stack. While he pretends to be confused whenever the family talks about DeFi or meme coins, his cold wallet has been untouched since 2011.",
        "Loves to say, \"Back in my day, we invested in real assets,\" while secretly DCA'ing into BTC every dip. He watches the market meltdown with a blank stare while the rest of the family panics, occasionally muttering things like \"I've seen worse\" and \"Just wait for the halving.\"",
        "Larry constantly tries to explain the latest yield farm to him, unaware Harold could buy them all out 10 times over. When asked about selling, Harold just chuckles and says, \"Maybe when it hits a million.\""
      ],
      image: "/images/cast/harold.png",
      position: "left"
    },
    {
      name: "Elon Musk",
      role: "THE WILDCARD",
      description: [
        "A wildcard billionaire who moves markets with a single tweet. Can make or break an entire ecosystem by posting a meme at 3 AM.",
        "One minute he's shilling Dogecoin, the next he's dropping cryptic hints about a new AI blockchain. No one knows if he actually believes in the stuff he promotes, or if he's just having fun. Either way, every degen follows his wallet like it's gospel.",
        "Elon thrives on chaos—he's launched coins as jokes, sent Bitcoin into a freefall with a single comment, and somehow convinced an entire generation that Mars-based economies are inevitable. He's either five steps ahead or completely winging it, and no one can tell which."
      ],
      image: "/images/cast/elon.png",
      position: "right"
    },
    {
      name: "The Alien",
      role: "THE MYSTERIOUS ONE",
      description: [
        "No one knows where it came from, but it somehow understands liquidity pools better than most humans. Claims to have 'seen the future of crypto' and says decentralization is inevitable.",
        "Spends most of its time in the shadows, only appearing when a new cycle is about to start. Some say it's Satoshi, others think it's just a hallucination from staring at charts too long.",
        "Whenever the market crashes, it reassures everyone that \"this is just the beginning\" before vanishing back into the blockchain. It only follows one address—an ancient whale wallet that hasn't moved since Bitcoin's genesis block."
      ],
      image: "/images/cast/alien.png",
      position: "left"
    },
    {
      name: "Trump",
      role: "THE HYPE MAN",
      description: [
        "The ultimate hype man of the space. Whether he's launching his own NFT collection or calling Bitcoin \"the greatest investment of all time,\" Trump knows how to get attention.",
        "Loves to remind everyone that \"Crypto is winning, and it's all because of me.\" Claims to have \"the best, most luxurious\" coins but still refuses to admit if he actually owns any.",
        "Every time a new token trends, he's convinced it's \"doing tremendous numbers\" and \"many people are saying\" it's the next big thing. Somehow, his name ends up tied to half the meme coins in circulation, even if he's never heard of them. When the market pumps, he takes full credit. When it crashes? \"Fake news.\""
      ],
      image: "/images/cast/trump.png",
      position: "right"
    },
    {
      name: "Pepe",
      role: "THE MEME KING",
      description: [
        "The eternal meme king, ruling the internet long before crypto was even a thing. Somehow, he became the face of entire market cycles—whether it's euphoria or absolute despair, Pepe is always there.",
        "A symbol of hope during bull runs and existential dread during bear markets, he's been minted, remixed, and rugged more times than anyone can count. One day, he's a million-dollar NFT, the next, he's the last thing you see before your portfolio goes to zero.",
        "Pepe doesn't speak, yet he says everything. He doesn't trade, yet he controls the market's emotions. No roadmap, no utility—just pure, unfiltered vibes."
      ],
      image: "/images/cast/pepe.png",
      position: "left"
    }
  ];

  useEffect(() => {
    castRefs.current = castRefs.current.slice(0, castMembers.length);
  }, [castMembers.length]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('cast-visible');
        }
      });
    }, { threshold: 0.2 });

    castRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      castRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [isLoading]);

  const handleInitialize = () => {
    const hoverSound = document.getElementById('hover-sound') as HTMLAudioElement;
    const selectSound = document.getElementById('select-sound') as HTMLAudioElement;
    
    Promise.all([
      hoverSound.play().then(() => hoverSound.pause()),
      selectSound.play().then(() => selectSound.pause())
    ]).catch(console.error);

    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>Cast · DegenSwim</title>
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
        title="[MEET THE DEGENS]"
        subtitle="[THE FAMILY THAT DEGENS TOGETHER, STAYS TOGETHER]"
        buttonText="Meet The Cast!"
      />

      <canvas id="gridCanvas" className="fixed top-0 left-0 w-full h-full z-0" />
      <CRTOverlay />
      <BackgroundVideo />
      
      <div className="relative z-10 min-h-screen cast-page-container">
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

        <div className="template-container mx-auto px-4 cast-page-content">
          <main className="template-content flex flex-col items-center">
            <div className="degenswim-title cast-page-title">
              CAST
            </div>

            <div className="stream-window w-full max-w-5xl pb-20 cast-page-content">
              <div className="cast-timeline-container">
                {castMembers.map((member, index) => (
                  <div
                    key={member.name}
                    ref={el => castRefs.current[index] = el}
                    className={`cast-member ${member.position}`}
                  >
                    <div className="cast-card" style={{ 
                      boxShadow: `0 0 20px rgba(${member.position === 'left' ? '176, 38, 255' : '0, 243, 255'}, 0.3)`
                    }}>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 w-full md:w-48 h-48 relative overflow-hidden rounded-lg border-2 border-[#00f3ff]">
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ 
                              boxShadow: `0 0 15px rgba(${member.position === 'left' ? '176, 38, 255' : '0, 243, 255'}, 0.5)`,
                            }}
                          >
                            <img 
                              src={member.image} 
                              alt={`${member.name} portrait`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error(`Failed to load image: ${member.image}`);
                                // Set a fallback image or placeholder
                                e.currentTarget.src = "/images/placeholder-character.png";
                              }}
                              style={{
                                objectPosition: 'center',
                                filter: 'brightness(1.1)',
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold mb-1" style={{ 
                            color: 'white',
                            textShadow: `0 0 15px rgba(${member.position === 'left' ? '255, 100, 255' : '30, 255, 255'}, 0.9)`,
                            filter: 'brightness(1.2)'
                          }}>
                            {member.name}
                          </h2>
                          <h3 className="text-xl mb-4" style={{
                            color: 'white',
                            textShadow: `0 0 12px rgba(30, 255, 255, 0.9)`,
                            filter: 'brightness(1.2)'
                          }}>
                            {member.role}
                          </h3>
                          
                          <div className="space-y-4">
                            {member.description.map((paragraph, pIndex) => (
                              <p key={pIndex} style={{
                                color: 'white',
                                textShadow: '0 0 2px rgba(255, 255, 255, 0.5)',
                                filter: 'brightness(1.1)'
                              }}>
                                {paragraph}
                              </p>
                            ))}
                          </div>
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