import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { useSolanaWallets } from '@privy-io/react-auth';
import { PublicKey, Transaction, Connection, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl, 
  TransactionMessage, VersionedTransaction, ComputeBudgetProgram } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';

// Add Token-2022 Program ID
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

async function verifyToken() {
  const url = "/api/verify";
  const accessToken = await getAccessToken();
  const result = await fetch(url, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined),
    },
  });

  return await result.json();
}

export default function DashboardPage() {
  const [verifyResult, setVerifyResult] = useState();
  const router = useRouter();
  const {
    ready,
    authenticated,
    user,
    logout,
    linkEmail,
    linkWallet,
    unlinkEmail,
    linkPhone,
    unlinkPhone,
    unlinkWallet,
    linkGoogle,
    unlinkGoogle,
    linkTwitter,
    unlinkTwitter,
    linkDiscord,
    unlinkDiscord,
  } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [txSignature, setTxSignature] = useState<string>("");
  const [topic, setTopic] = useState<string>("");

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  const email = user?.email;
  const phone = user?.phone;
  const wallet = user?.wallet;

  const googleSubject = user?.google?.subject || null;
  const twitterSubject = user?.twitter?.subject || null;
  const discordSubject = user?.discord?.subject || null;

  const sendSolanaTransaction = async () => {
    try {
      const wallet = wallets[0];
      if (!ready || !wallet) {
        console.error("Wallet not ready");
        return;
      }

      console.log("Wallet:", wallet);
      console.log("Wallet address:", wallet.address);

      const connection = new Connection(clusterApiUrl('devnet'));

      // Define transaction parameters
      const params = {
        senderAddress: wallet.address,
        recipientAddress: "DQFL1TuaDDTYVPKLk1QNTWTcYUV9JynxpSjTy2y7bXiJ",
        tokenMint: "mntJQeeYTGFuxm1tUBmLNVZzNHEsasddX5nK6SXmBQr",
        amount: BigInt(100 * (10 ** 9)), // 100 tokens with 9 decimals
        isNative: false
      };

      try {
        // Get sender's token account using Token-2022 program
        const senderTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(params.tokenMint),
          new PublicKey(params.senderAddress),
          false,
          TOKEN_2022_PROGRAM_ID  // Use Token-2022 program
        );
        console.log("Sender token account:", senderTokenAccount.toString());

        // Get recipient's token account using Token-2022 program
        const recipientTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(params.tokenMint),
          new PublicKey(params.recipientAddress),
          false,
          TOKEN_2022_PROGRAM_ID  // Use Token-2022 program
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
          // Create Associated Token Account for recipient using Token-2022 program
          transaction.add(
            createAssociatedTokenAccountInstruction(
              new PublicKey(params.senderAddress), // payer
              recipientTokenAccount, // ata
              new PublicKey(params.recipientAddress), // owner
              new PublicKey(params.tokenMint), // mint
              TOKEN_2022_PROGRAM_ID  // Use Token-2022 program
            )
          );
        }

        // Add transfer instruction using Token-2022 program
        transaction.add(
          createTransferInstruction(
            senderTokenAccount, // source
            recipientTokenAccount, // destination
            new PublicKey(params.senderAddress), // owner
            Number(params.amount), // amount
            [],  // multiSigners
            TOKEN_2022_PROGRAM_ID  // Use Token-2022 program
          )
        );

        // Set transaction properties
        transaction.feePayer = new PublicKey(params.senderAddress);
        transaction.recentBlockhash = blockhash;

        try {
          // Sign and send transaction
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
          
          // First check if the response is JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const responseText = await response.text();
            console.error('Non-JSON response:', responseText);
            throw new Error(`${errorMessage}: Received non-JSON response - ${responseText}`);
          }

          // Parse JSON response
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
    <>
      <Head>
        <title>Privy Auth Demo</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">Privy Auth Demo</h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>
            <div className="mt-12 flex gap-4 flex-wrap">
              {googleSubject ? (
                <button
                  onClick={() => {
                    unlinkGoogle(googleSubject);
                  }}
                  className="text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink Google
                </button>
              ) : (
                <button
                  onClick={() => {
                    linkGoogle();
                  }}
                  className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white"
                >
                  Link Google
                </button>
              )}

              {twitterSubject ? (
                <button
                  onClick={() => {
                    unlinkTwitter(twitterSubject);
                  }}
                  className="text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink Twitter
                </button>
              ) : (
                <button
                  className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white"
                  onClick={() => {
                    linkTwitter();
                  }}
                >
                  Link Twitter
                </button>
              )}

              {discordSubject ? (
                <button
                  onClick={() => {
                    unlinkDiscord(discordSubject);
                  }}
                  className="text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink Discord
                </button>
              ) : (
                <button
                  className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white"
                  onClick={() => {
                    linkDiscord();
                  }}
                >
                  Link Discord
                </button>
              )}

              {email ? (
                <button
                  onClick={() => {
                    unlinkEmail(email.address);
                  }}
                  className="text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink email
                </button>
              ) : (
                <button
                  onClick={linkEmail}
                  className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white"
                >
                  Connect email
                </button>
              )}
              {wallet ? (
                <button
                  onClick={() => {
                    unlinkWallet(wallet.address);
                  }}
                  className="text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink wallet
                </button>
              ) : (
                <button
                  onClick={linkWallet}
                  className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none"
                >
                  Connect wallet
                </button>
              )}
              {phone ? (
                <button
                  onClick={() => {
                    unlinkPhone(phone.number);
                  }}
                  className="text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500"
                  disabled={!canRemoveAccount}
                >
                  Unlink phone
                </button>
              ) : (
                <button
                  onClick={linkPhone}
                  className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none"
                >
                  Connect phone
                </button>
              )}

              <button
                onClick={() => verifyToken().then(setVerifyResult)}
                className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none"
              >
                Verify token on server
              </button>

              {Boolean(verifyResult) && (
                <details className="w-full">
                  <summary className="mt-6 font-bold uppercase text-sm text-gray-600">
                    Server verify result
                  </summary>
                  <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
                    {JSON.stringify(verifyResult, null, 2)}
                  </pre>
                </details>
              )}

              <div className="flex flex-col gap-4 w-full max-w-md">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your topic"
                  className="px-4 py-2 border rounded-md"
                />
                <button
                  onClick={sendSolanaTransaction}
                  disabled={!ready || !wallets[0] || !topic.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                >
                  Submit Topic (100 SPL Tokens)
                </button>
              </div>

              {txSignature && (
                <div className="mt-4">
                  <p className="font-semibold">Transaction Sent!</p>
                  <p className="text-sm break-all">
                    Signature: {txSignature}
                  </p>
                  <a 
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View on Solana Explorer
                  </a>
                </div>
              )}
            </div>

            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              User object
            </p>
            <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
              {JSON.stringify(user, null, 2)}
            </pre>
          </>
        ) : null}
      </main>
    </>
  );
}
