import type { NextApiRequest, NextApiResponse } from 'next';
import { RedisWrapper } from '../../utils/redis-wrapper';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const redisWrapper = new RedisWrapper();
    
    // Get latest topics (last 50)
    const topics = await redisWrapper.zrevrange('topics', 0, 49);
    
    // Handle different data formats that might be in Redis
    const parsedTopics = topics.map(topic => {
      try {
        // Check if it's already an object
        if (typeof topic === 'object' && topic !== null) {
          return topic;
        }
        
        // Try to parse it as JSON
        return JSON.parse(topic);
      } catch (error) {
        console.error('Error parsing topic:', topic);
        // Return a minimal valid object if parsing fails
        return { 
          topic: "Failed to parse topic", 
          sender: "unknown", 
          signature: Date.now().toString() 
        };
      }
    });

    return res.status(200).json(parsedTopics);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Failed to fetch topics' });
  }
} 