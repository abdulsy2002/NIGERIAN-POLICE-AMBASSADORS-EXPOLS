import { BadRequestException } from '@nestjs/common';
import { validateBase64Upload } from './base64-upload';

describe('validateBase64Upload', () => {
  it('accepts a supported file whose data matches its declared type', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(() => validateBase64Upload(
      `data:image/png;base64,${png.toString('base64')}`,
      ['image/png'],
      1024,
      'Passport photo',
    )).not.toThrow();
  });

  it('rejects malformed, mismatched, unsupported, and oversized uploads', () => {
    expect(() => validateBase64Upload('not-a-data-url', ['image/png'], 1024, 'Upload'))
      .toThrow(BadRequestException);
    expect(() => validateBase64Upload(
      `data:image/png;base64,${Buffer.from('not a PNG').toString('base64')}`,
      ['image/png'],
      1024,
      'Upload',
    )).toThrow(BadRequestException);
    expect(() => validateBase64Upload(
      `data:image/png;base64,${Buffer.from('body').toString('base64')}`,
      ['image/jpeg'],
      1024,
      'Upload',
    )).toThrow(BadRequestException);
    expect(() => validateBase64Upload(
      `data:image/png;base64,${Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.alloc(8),
      ]).toString('base64')}`,
      ['image/png'],
      8,
      'Upload',
    )).toThrow(BadRequestException);
  });

  it('allows omitted optional uploads', () => {
    expect(() => validateBase64Upload(undefined, ['image/png'], 1024, 'Upload')).not.toThrow();
  });
});
