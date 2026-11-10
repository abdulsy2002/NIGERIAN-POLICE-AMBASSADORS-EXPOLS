import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { validateBase64Upload } from '../common/base64-upload';

@Injectable()
export class S3StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('S3_BUCKET') || 'expols-gallery';
    this.client = new S3Client({
      endpoint: config.getOrThrow<string>('AWS_ENDPOINT_URL_S3'),
      region: config.get<string>('AWS_REGION') || 'us-east-2',
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadBase64(value: string, folder: string) {
    const match = value.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]*={0,2})$/i);
    if (!match) throw new BadRequestException('Upload must be a JPEG, PNG, WebP, or GIF image');
    const [, contentType, encoded] = match;
    validateBase64Upload(value, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], 6 * 1024 * 1024, 'Image');
    const body = Buffer.from(encoded, 'base64');
    const extension = contentType.toLowerCase().split('/')[1];
    const key = `${folder}/${randomUUID()}.${extension}`;
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType.toLowerCase() }));
    return key;
  }

  async signedUrl(key: string) {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn: 900 });
  }

  async delete(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
