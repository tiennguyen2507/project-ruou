import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;
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
        this.ensureFolderExists(this.defaultFolder);
      } else {
        this.logger.warn('Could not parse CLOUDINARY_URL regex.');
      }
    } else {
      this.logger.warn('CLOUDINARY_URL is missing in environment variables.');
    }
  }

  /**
   * Ensure dedicated folder exists on Cloudinary
   */
  async ensureFolderExists(folderName: string = this.defaultFolder) {
    try {
      await cloudinary.api.create_folder(folderName);
      this.logger.log(`Folder '${folderName}' ready on Cloudinary.`);
    } catch (e: any) {
      // Folder might already exist or ignore
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
      throw new Error('Cloudinary is not configured. Please check CLOUDINARY_URL in .env');
    }

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
          if (error) {
            this.logger.error(`Failed to upload image to Cloudinary: ${error.message}`);
            return reject(error);
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
    if (!publicId || !this.isConfigured) return false;

    try {
      this.logger.log(`Deleting image from Cloudinary: ${publicId}...`);
      const result = await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
      });
      this.logger.log(`Deleted image from Cloudinary (${publicId}): ${JSON.stringify(result)}`);
      return result.result === 'ok';
    } catch (error: any) {
      this.logger.error(`Error deleting image from Cloudinary (${publicId}): ${error.message}`);
      return false;
    }
  }
}
