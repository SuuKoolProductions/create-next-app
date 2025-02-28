import { Redis } from '@upstash/redis';

export class RedisWrapper {
  private client: Redis;

  constructor() {
    // Add protocol to URL and ensure environment variables are properly accessed
    const url = `https://${process.env.UPSTASH_REDIS_REST_URL}`;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    // Log to debug (remove in production)
    console.log("Redis URL:", url);
    console.log("Redis Token exists:", !!token);
    
    this.client = new Redis({
      url,
      token: token || '',
    });
  }

  async zrevrange(key: string, start: number, end: number): Promise<any[]> {
    try {
      const result = await this.client.zrange(key, start, end, { rev: true });
      return result || [];
    } catch (error) {
      console.error('Redis zrevrange error:', error);
      return [];
    }
  }

  async disconnect() {
    return;
  }
} 