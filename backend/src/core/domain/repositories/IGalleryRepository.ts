import { GalleryImage } from '../entities/Gallery';

export interface IGalleryRepository {
  findById(id: string): Promise<GalleryImage | null>;
  create(image: GalleryImage): Promise<GalleryImage>;
  update(id: string, image: Partial<GalleryImage>): Promise<GalleryImage | null>;
  delete(id: string): Promise<boolean>;
  find(query: any, options?: { sort?: any; limit?: number }): Promise<GalleryImage[]>;
}
