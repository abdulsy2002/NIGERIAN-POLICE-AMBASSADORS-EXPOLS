import bcrypt from 'bcryptjs';

export class BcryptService {
  private readonly rounds = 10;

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.rounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
