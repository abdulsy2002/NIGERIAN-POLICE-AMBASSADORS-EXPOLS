import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports the API and database as healthy after a successful query', async () => {
    const controller = new HealthController({ $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) } as never);

    await expect(controller.check()).resolves.toMatchObject({ status: 'UP', database: 'UP' });
  });

  it('returns an unavailable error when the database health check fails', async () => {
    const controller = new HealthController({ $queryRaw: jest.fn().mockRejectedValue(new Error('database unavailable')) } as never);

    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
