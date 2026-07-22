import mongoose, { Schema } from 'mongoose';
import { GalleryImage } from '../../../core/domain/entities/Gallery';

const GalleryImageSchema = new Schema<GalleryImage>(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true },
    category: { type: String, default: 'General' },
    uploadedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const GalleryModel = mongoose.models.GalleryImage || 
  mongoose.model<GalleryImage>('GalleryImage', GalleryImageSchema);
