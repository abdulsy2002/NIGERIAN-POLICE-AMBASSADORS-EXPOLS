import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly connection?: IORedis;
  private readonly queues = new Map<string, Queue>();

  constructor(config: ConfigService) {
    const redisUrl = config.get<string>('REDIS_URL');
    if (redisUrl) this.connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  }

  getQueue(name: string) {
    if (!this.connection) return undefined;
    if (!this.queues.has(name)) this.queues.set(name, new Queue(name, { connection: this.connection }));
    return this.queues.get(name);
  }

  async onModuleDestroy() {
    await Promise.all([...this.queues.values()].map(queue => queue.close()));
    await this.connection?.quit();
  }
}