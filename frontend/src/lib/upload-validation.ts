export const MEMBER_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const MEMBER_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
] as const;

export function getUploadError(
  file: File,
  allowedTypes: readonly string[],
  maxBytes: number,
  label: string,
): string | null {
  if (!allowedTypes.includes(file.type)) return `${label} must be a supported file type.`;
  if (file.size > maxBytes) return `${label} must be no larger than ${Math.floor(maxBytes / (1024 * 1024))} MB.`;
  return null;
}
