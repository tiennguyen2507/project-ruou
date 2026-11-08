import { Body, Controller, Delete, Post, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';
import { ImageSignatureValidator } from './image-signature.validator';
import { CloudinaryService } from './cloudinary.service';

export class UploadImageDto {
  @ApiPropertyOptional({ example: 'banners', default: 'common_images', description: 'Thư mục lưu trên Cloudinary, hỗ trợ thư mục con như products/wine. Để trống dùng common_images.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  folder?: string;
}

export class DeleteImageDto {
  @ApiProperty({ example: 'common_images/abc123', description: 'public_id trả về khi upload, bao gồm thư mục và không có đuôi file.' })
  @IsString()
  @MaxLength(255)
  @Matches(/^[^\s]+(?: [^\s]+)*$/, { message: 'publicId không được rỗng hoặc có khoảng trắng ở đầu/cuối.' })
  publicId: string;
}

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @ApiOperation({ summary: 'Upload ảnh dùng chung lên Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' }, folder: { type: 'string', default: 'common_images', example: 'banners', maxLength: 255, description: 'Thư mục lưu trên Cloudinary (ví dụ products/wine). Để trống dùng common_images.' } } } })
  @ApiResponse({ status: 201, description: 'Ảnh đã lưu. data gồm secure_url, public_id, format, bytes.', schema: { example: { success: true, data: { secure_url: 'https://res.cloudinary.com/demo/image/upload/common_images/abc123.jpg', public_id: 'common_images/abc123', format: 'jpg', bytes: 12345 } } } })
  @ApiResponse({ status: 400, description: 'Thiếu file, file rỗng hoặc định dạng không hỗ trợ.' })
  @ApiResponse({ status: 413, description: 'Ảnh vượt quá 5 MiB.' })
  @ApiResponse({ status: 503, description: 'Chưa cấu hình Cloudinary.' })
  @ApiResponse({ status: 502, description: 'Cloudinary không xử lý được yêu cầu.' })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } }))
  async upload(@UploadedFile(new ParseFilePipe({ validators: [
    new ImageSignatureValidator(),
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
    new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
  ] })) file: Express.Multer.File, @Body() dto: UploadImageDto) {
    return { success: true, data: await this.cloudinaryService.uploadImage(file, dto.folder?.trim() || this.cloudinaryService.commonFolder) };
  }

  @Delete()
  @ApiOperation({ summary: 'Xoá ảnh trên Cloudinary bằng public_id (hỗ trợ ID có dấu /)' })
  @ApiResponse({ status: 200, schema: { example: { success: true, data: { public_id: 'common_images/abc123', deleted: true } } } })
  @ApiResponse({ status: 400, description: 'publicId không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Ảnh không tồn tại.' })
  @ApiResponse({ status: 503, description: 'Chưa cấu hình Cloudinary.' })
  @ApiResponse({ status: 502, description: 'Cloudinary không xử lý được yêu cầu.' })
  async remove(@Body() dto: DeleteImageDto) {
    const deleted = await this.cloudinaryService.deleteImage(dto.publicId);
    if (!deleted) throw new NotFoundException('Ảnh không tồn tại trên Cloudinary.');
    return { success: true, data: { public_id: dto.publicId, deleted } };
  }
}
