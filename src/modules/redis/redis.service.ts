import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      tls: {},
      maxRetriesPerRequest: null,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }
  async set(
    key: string,
    value: string,
    expirationInSeconds: number,
  ): Promise<void> {
    await this.redis.setex(key, expirationInSeconds, value);
  }
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
