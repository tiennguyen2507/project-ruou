import { Module, Global } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { CloudinaryService } from './cloudinary.service';

@Global()
@Module({
  controllers: [ImagesController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}

