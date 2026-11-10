import { BadRequestException } from '@nestjs/common';

const signatures: Record<string, (bytes: Buffer) => boolean> = {
  'image/jpeg': (bytes) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  'image/png': (bytes) => bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (bytes) => bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP',
  'image/gif': (bytes) => ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6)),
  'application/pdf': (bytes) => bytes.toString('ascii', 0, 5) === '%PDF-',
  'application/msword': (bytes) => bytes.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (bytes) =>
    bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04,
};

export function validateBase64Upload(
  value: string | undefined,
  allowedTypes: readonly string[],
  maxBytes: number,
  fieldName: string,
): void {
  if (!value) return;

  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) throw new BadRequestException(`${fieldName} must be a valid base64 data URL`);
  const [, rawContentType, encoded] = match;
  const contentType = rawContentType.toLowerCase();
  if (!allowedTypes.includes(contentType)) {
    throw new BadRequestException(`${fieldName} has an unsupported file type`);
  }

  const bytes = Buffer.from(encoded, 'base64');
  if (
    bytes.length === 0
    || bytes.length > maxBytes
    || bytes.toString('base64') !== encoded
    || !signatures[contentType]?.(bytes)
  ) {
    throw new BadRequestException(`${fieldName} must be a valid file no larger than ${Math.floor(maxBytes / (1024 * 1024))} MB`);
  }
}
