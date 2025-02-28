import React, { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { PublicKey, Transaction, Connection, clusterApiUrl } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useRouter } from 'next/router';

// Add Token-2022 Program ID (same as dashboard)
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

interface NavButtonProps {
  text: string | React.ReactNode;
  color: 'blue' | 'green' | 'red';
  onClick?: () => void;
}

const NavButton: React.FC<NavButtonProps & { className?: string }> = ({ text, color, className = '', onClick }) => {
  const playHoverSound = () => {
    const audio = document.getElementById('hover-sound') as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const playSelectSound = () => {
    const audio = document.getElementById('select-sound') as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const handleClick = () => {
    playSelectSound();
    if (onClick) onClick();
  };

  return (
    <button 
      className={`menu-item ${className}`}
      data-sound="hover"
      onMouseEnter={playHoverSound}
      onClick={handleClick}
    >
      <div className="relative">
        <div className={`${color}-item-stroke`}>{text}</div>
        <div className={`${color}-item-no-stroke`}>{text}</div>
      </div>
    </button>
  );
};

const Navigation: React.FC = () => {
  const router = useRouter();
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [topic, setTopic] = useState('');
  const [txSignature, setTxSignature] = useState('');

  const handleLogin = () => {
    login({
      loginMethods: ['wallet'],
    });
  };

  const handleLogout = () => {
    playSelectSound();
    logout();
  };

  const playSelectSound = () => {
    const audio = document.getElementById('select-sound') as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const handleClipsClick = () => {
    playSelectSound();
    router.push('/clips');
  };

  const handleWatchLive = () => {
    playSelectSound();
    router.push('/');
  };

  const sendSolanaTransaction = async () => {
    try {
      const wallet = wallets[0];
      if (!wallet) {
        console.error("Wallet not ready");
        return;
      }

      console.log("Wallet:", wallet);
      console.log("Wallet address:", wallet.address);

      const connection = new Connection(clusterApiUrl('devnet'));

      // Define transaction parameters
      const params = {
        senderPublicKey: new PublicKey(wallet.address),
        recipientAddress: new PublicKey("DQFL1TuaDDTYVPKLk1QNTWTcYUV9JynxpSjTy2y7bXiJ"),
        tokenMint: new PublicKey("mntJQeeYTGFuxm1tUBmLNVZzNHEsasddX5nK6SXmBQr"),
        amount: BigInt(100 * (10 ** 9)),
        isNative: false
      };

      try {
        // Get sender's token account using Token-2022 program
        const senderTokenAccount = await getAssociatedTokenAddress(
          params.tokenMint,
          params.senderPublicKey,
          false,
          TOKEN_2022_PROGRAM_ID
        );
        console.log("Sender token account:", senderTokenAccount.toString());

        // Get recipient's token account using Token-2022 program
        const recipientTokenAccount = await getAssociatedTokenAddress(
          params.tokenMint,
          params.recipientAddress,
          false,
          TOKEN_2022_PROGRAM_ID
        );
        console.log("Recipient token account:", recipientTokenAccount.toString());

        // Get latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
        
        // Create transaction
        const transaction = new Transaction();

        // Check if recipient account exists
        const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
        console.log("Recipient account exists:", !!recipientAccountInfo);

        if (!recipientAccountInfo) {
          console.log("Creating recipient token account...");
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

        // Add transfer instruction using Token-2022 program
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

        // Set transaction properties
        transaction.feePayer = params.senderPublicKey;
        transaction.recentBlockhash = blockhash;

        try {
          console.log("Sending transaction...");
          const signature = await wallet.sendTransaction(transaction, connection);
          console.log("Transaction sent! Signature:", signature);
          setTxSignature(signature);

          // Wait for confirmation
          const confirmation = await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight
          }, 'confirmed');

          if (confirmation.value.err) {
            throw new Error("Transaction failed");
          }

          // Submit topic to our API
          console.log("Submitting topic to API...");
          const response = await fetch('/api/submit-topic', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              signature,
              topic,
            }),
          });

          let errorMessage = 'Failed to submit topic';
          
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const responseText = await response.text();
            console.error('Non-JSON response:', responseText);
            throw new Error(`${errorMessage}: Received non-JSON response - ${responseText}`);
          }

          const data = await response.json();
          console.log("API Response:", data);
          
          if (!response.ok) {
            errorMessage = data.error || errorMessage;
            if (data.details) {
              errorMessage += `: ${data.details}`;
            }
            throw new Error(errorMessage);
          }

          console.log("Topic submitted successfully!");
          setTopic(''); // Clear the input

        } catch (sendError: any) {
          console.error("Error details:", sendError);
          const errorMessage = sendError.message || 'Failed to submit topic';
          alert(errorMessage);
          throw sendError;
        }

      } catch (error) {
        console.error("Error in transaction preparation:", error);
        throw error;
      }

    } catch (error) {
      console.error("Top level error:", error);
    }
  };

  return (
    <nav className="ps2-nav">
      <div style={{ display: 'flex', gap: '50px', alignItems: 'center' }}>
        {router.pathname === '/clips' ? (
          <NavButton 
            text={
              <span className="flex items-center">
                <span className="live-bullet" />
                WATCH LIVE
              </span>
            } 
            color="red" 
            onClick={handleWatchLive}
            className="live-button"
          />
        ) : (
          <NavButton text="Clips" color="blue" onClick={handleClipsClick} />
        )}
        {!authenticated ? (
          <NavButton 
            text="Login+" 
            color="green" 
            onClick={handleLogin}
            className="login-button"
          />
        ) : (
          <>
            <NavButton 
              text="Logout" 
              color="red" 
              onClick={handleLogout}
              className="logout-button"
            />
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Priority Topic Submission - Costs 100 DEGENSWIM"
                className="topic-input"
              />
              <NavButton 
                text="Submit" 
                color="blue" 
                onClick={sendSolanaTransaction} 
              />
            </div>
          </>
        )}
      </div>
      {txSignature && (
        <div className="transaction-notification">
          <div className="text-[#00f3ff] mb-6 text-lg text-center">
            Transaction Sent!
          </div>
          <a 
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="menu-item !p-2 !text-xs"
          >
            <div className="relative">
              <div className="blue-item-stroke">View on Solana Explorer</div>
              <div className="blue-item-no-stroke">View on Solana Explorer</div>
            </div>
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 