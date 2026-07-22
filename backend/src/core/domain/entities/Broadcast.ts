export interface Broadcast {
  id?: string;
  subject: string;
  message: string;
  sentTo: string;
  sentBy: string;
  targetBaseCode?: string | null;
  targetBaseName?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
