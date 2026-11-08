import { FileValidator } from '@nestjs/common';

/** Check bytes as well as the client-provided MIME type before uploading. */
export class ImageSignatureValidator extends FileValidator {
  constructor() { super({}); }

  isValid(file?: Express.Multer.File): boolean {
    const bytes = file?.buffer;
    if (!bytes?.length) return false;
    switch (file.mimetype) {
      case 'image/jpeg':
        return bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
      case 'image/png':
        return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      case 'image/gif':
        return ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6));
      case 'image/webp':
        return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
      default:
        return false;
    }
  }

  buildErrorMessage(): string {
    return 'Chỉ hỗ trợ ảnh JPEG, PNG, WebP, GIF có nội dung phù hợp định dạng.';
  }
}
