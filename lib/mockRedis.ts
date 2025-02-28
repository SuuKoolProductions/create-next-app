class MockRedis {
  private store: Map<string, Map<number, string>>;

  constructor() {
    this.store = new Map();
  }

  async zadd(key: string, score: number, member: string) {
    if (!this.store.has(key)) {
      this.store.set(key, new Map());
    }
    this.store.get(key)!.set(score, member);
    return 1;
  }

  async zrevrange(key: string, start: number, stop: number) {
    const sorted = Array.from(this.store.get(key)?.entries() || [])
      .sort((a, b) => b[0] - a[0])
      .map(([_, value]) => value)
      .slice(start, stop + 1);
    return sorted;
  }
}

export const redis = new MockRedis(); 