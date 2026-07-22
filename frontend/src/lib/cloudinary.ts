import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload Base64 images to Cloudinary
export async function uploadImageToCloudinary(base64String: string, folder: string) {
  try {
    // If it's already a URL (from a previous upload), just return it
    if (base64String.startsWith('http')) {
      return base64String;
    }

    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder, // e.g., 'npae/gallery', 'npae/board'
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Optimize size
        { quality: 'auto', fetch_format: 'auto' }   // Auto format (WebP)
      ]
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

export default cloudinary;