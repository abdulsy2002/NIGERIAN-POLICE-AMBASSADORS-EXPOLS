import { Broadcast } from '../entities/Broadcast';

export interface IBroadcastRepository {
  create(broadcast: Broadcast): Promise<Broadcast>;
  find(query: any, options?: { sort?: any; limit?: number }): Promise<Broadcast[]>;
}
