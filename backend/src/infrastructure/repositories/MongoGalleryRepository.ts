import { GalleryImage } from '../../core/domain/entities/Gallery';
import { IGalleryRepository } from '../../core/domain/repositories/IGalleryRepository';
import { GalleryModel } from '../db/models/GalleryModel';

export class MongoGalleryRepository implements IGalleryRepository {
  async findById(id: string): Promise<GalleryImage | null> {
    const doc = await GalleryModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async create(image: GalleryImage): Promise<GalleryImage> {
    const doc = await GalleryModel.create(image);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, image: Partial<GalleryImage>): Promise<GalleryImage | null> {
    const doc = await GalleryModel.findByIdAndUpdate(id, image, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await GalleryModel.findByIdAndDelete(id);
    return res !== null;
  }

  async find(query: any, options?: { sort?: any; limit?: number }): Promise<GalleryImage[]> {
    let q = GalleryModel.find(query);
    if (options?.sort) q = q.sort(options.sort);
    if (options?.limit) q = q.limit(options.limit);
    const docs = await q.lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  private mapToEntity(doc: any): GalleryImage {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as GalleryImage;
  }
}
