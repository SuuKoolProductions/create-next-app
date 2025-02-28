import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: 'https://vital-perch-18715.upstash.io',
  token: 'AUkbAAIjcDFhOGRhNWFmMTE2ZGE0ZWFkODVjMzQ0NjlhZWQ0Y2M2ZnAxMA',
});

// Wrapper with retries
export const redisWrapper = {
  async set(key: string, value: string, retries = 2) {
    for (let i = 0; i <= retries; i++) {
      try {
        return await redis.set(key, value);
      } catch (error) {
        if (i === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  },

  async get(key: string, retries = 2) {
    for (let i = 0; i <= retries; i++) {
      try {
        return await redis.get(key);
      } catch (error) {
        if (i === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  },

  async zadd(key: string, score: number, member: string, retries = 2) {
    for (let i = 0; i <= retries; i++) {
      try {
        const result = await redis.zadd(key, { score, member });
        console.log('ZADD Success:', { key, score, result });
        return result;
      } catch (error) {
        console.error(`ZADD Attempt ${i + 1} failed:`, error);
        if (i === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  },

  async zrevrange(key: string, start: number, stop: number, retries = 2) {
    for (let i = 0; i <= retries; i++) {
      try {
        return await redis.zrange(key, start, stop, { rev: true });
      } catch (error) {
        if (i === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
};

export { redis };