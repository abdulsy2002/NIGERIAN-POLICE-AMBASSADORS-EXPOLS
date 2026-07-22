export interface BoardMember {
  id?: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  isFeatured: boolean;
  linkedin?: string;
  twitter?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
