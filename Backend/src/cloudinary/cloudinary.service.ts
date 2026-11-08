import { Injectable, Logger, BadGatewayException, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;
  readonly commonFolder = 'common_images';
  readonly defaultFolder = 'ruoutot_products';

  constructor(private readonly configService: ConfigService) {
    let cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL') || process.env.CLOUDINARY_URL || '';
    // Strip surrounding quotes if present
    cloudinaryUrl = cloudinaryUrl.replace(/^["']|["']$/g, '').trim();

    if (cloudinaryUrl) {
      process.env.CLOUDINARY_URL = cloudinaryUrl;
      const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@([^/]+)/);
      if (match) {
        const [, api_key, api_secret, cloud_name] = match;
        cloudinary.config({
          cloud_name,
          api_key,
          api_secret,
          secure: true,
        });
        this.isConfigured = true;
        this.logger.log(`Cloudinary configured for cloud_name: ${cloud_name}`);
      } else {
        this.logger.warn('Could not parse CLOUDINARY_URL regex.');
      }
    } else {
      this.logger.warn('CLOUDINARY_URL is missing in environment variables.');
    }
  }

  /**
   * Upload an image buffer to Cloudinary in the specified folder with auto optimization
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = this.defaultFolder,
  ): Promise<{ secure_url: string; public_id: string; format: string; bytes: number }> {
    if (!this.isConfigured) {
      throw new ServiceUnavailableException('Cloudinary chưa được cấu hình. Kiểm tra CLOUDINARY_URL.');
    }

    if (!file?.buffer?.length) throw new BadRequestException('File ảnh không được rỗng.');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result: UploadApiResponse) => {
          if (error || !result) {
            this.logger.error(`Failed to upload image to Cloudinary: ${error?.message}`);
            return reject(new BadGatewayException('Không thể tải ảnh lên Cloudinary.'));
          }
          this.logger.log(`Uploaded image to Cloudinary: ${result.public_id} (${result.secure_url})`);
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Delete an image from Cloudinary by its public ID
   */
  async deleteImage(publicId: string): Promise<boolean> {
    if (!this.isConfigured) throw new ServiceUnavailableException('Cloudinary chưa được cấu hình. Kiểm tra CLOUDINARY_URL.');
    if (!publicId?.trim()) throw new BadRequestException('publicId không được rỗng.');

    try {
      this.logger.log(`Deleting image from Cloudinary: ${publicId}...`);
      const result = await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
      });
      this.logger.log(`Deleted image from Cloudinary (${publicId}): ${JSON.stringify(result)}`);
      if (result.result === 'ok') return true;
      if (result.result === 'not found') return false;
      throw new Error('Unexpected Cloudinary response');
    } catch (error: any) {
      this.logger.error(`Error deleting image from Cloudinary (${publicId}): ${error?.message}`);
      throw new BadGatewayException('Không thể xoá ảnh trên Cloudinary.');
    }
  }
}
