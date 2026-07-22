import { v2 as cloudinary } from 'cloudinary';
import { IStorageService } from '../../core/application/services/IStorageService';

export class CloudinaryService implements IStorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(base64String: string, folder: string): Promise<string> {
    try {
      if (base64String.startsWith('http')) {
        return base64String;
      }

      const result = await cloudinary.uploader.upload(base64String, {
        folder: folder,
        resource_type: 'auto', // Support PDFs or other documents if sent
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload file to Cloudinary');
    }
  }
}
