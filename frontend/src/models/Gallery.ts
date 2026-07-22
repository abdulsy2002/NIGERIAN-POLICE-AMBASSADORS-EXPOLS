import mongoose, { Schema, Document } from "mongoose";

export interface IGalleryImage extends Document {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  uploadedBy: string;
  createdAt: Date;
}

const GalleryImageSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true },
    category: { type: String, default: 'General' },
    uploadedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.GalleryImage || 
  mongoose.model<IGalleryImage>("GalleryImage", GalleryImageSchema);