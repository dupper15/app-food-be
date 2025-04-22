import { Controller, Get } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller()
export class AppController {
  constructor(private readonly redisService: RedisService) {}

  @Get('set-redis')
  async setRedis() {
    await this.redisService.set('hello', 'world', 3600);
    return 'Set Redis';
  }

  @Get('get-redis')
  async getRedis() {
    const value = await this.redisService.get('hello');
    return `Value from Redis: ${value}`;
  }
}
