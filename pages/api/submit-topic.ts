import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, ParsedTransactionWithMeta } from '@solana/web3.js';
import { redisWrapper } from '../../lib/redis';

// Error handler wrapper
const apiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Set JSON content type
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!req.body) {
      return res.status(400).json({ error: 'Missing request body' });
    }

    const { signature, topic } = req.body;

    if (!signature || !topic) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Connect to Solana devnet
    const connection = new Connection('https://api.devnet.solana.com');

    // Get transaction details
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
    });

    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Type guard to ensure tx.transaction.message.accountKeys exists
    if (!tx.transaction?.message?.accountKeys?.[0]) {
      return res.status(400).json({ 
        error: 'Invalid transaction format',
        details: 'Transaction does not contain expected account keys'
      });
    }

    // Store in Redis
    const timestamp = Date.now();
    try {
      // Check if payment was made (balance changed)
      const amountPaid = (tx.meta?.preBalances[0] || 0) - (tx.meta?.postBalances[0] || 0);
      const paidPrefix = amountPaid > 0 ? '[PAID] ' : '';

      await redisWrapper.zadd('topics', timestamp, JSON.stringify({
        topic: `${paidPrefix}${topic}`,
        signature,
        timestamp,
        sender: tx.transaction.message.accountKeys[0].toString()
      }));

      return res.status(200).json({ success: true });
    } catch (redisError) {
      console.error('Redis Error:', redisError);
      return res.status(500).json({ 
        error: 'Database error',
        details: redisError instanceof Error ? redisError.message : 'Failed to store topic'
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    // Ensure we haven't sent headers yet
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// Export the wrapped handler
export default apiHandler; 