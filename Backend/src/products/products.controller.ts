import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /api/products
   * List products with search, filtering, and pagination
   */
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  /**
   * GET /api/products/slug/:slug
   * Get product by URL slug
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const product = await this.productsService.findBySlug(slug);
    return {
      success: true,
      data: product,
    };
  }

  /**
   * GET /api/products/:id
   * Get product by ID, SKU, or Slug
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return {
      success: true,
      data: product,
    };
  }

  /**
   * POST /api/products
   * Create a new product
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(createProductDto);
    return {
      success: true,
      message: 'Tạo mới sản phẩm thành công!',
      data: product,
    };
  }

  /**
   * PATCH /api/products/:id
   * UPDATE PRODUCT (Cập nhật một phần thông tin sản phẩm)
   * Parameter :id can be MongoDB _id, SKU (e.g. HP-CL-CARM01), or Slug
   */
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * PUT /api/products/:id
   * UPDATE PRODUCT (Hỗ trợ cả chuẩn PUT)
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updatePut(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * POST /api/products/:id/upload-image
   * Upload / update image to Cloudinary folder 'ruoutot_products'
   * Automatically deletes old image on Cloudinary
   */
  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file hình ảnh (file) để tải lên.');
    }
    return this.productsService.uploadProductImage(id, file);
  }

  /**
   * POST /api/products/upload-image
   * Standalone upload to Cloudinary (returns secure_url and public_id)
   */
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStandaloneImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file hình ảnh để tải lên.');
    }
    const result = await this.productsService.uploadStandaloneImage(file);
    return {
      success: true,
      message: 'Tải ảnh lên Cloudinary thành công!',
      data: result,
    };
  }

  /**
   * DELETE /api/products/:id
   * Remove a product and its associated Cloudinary image
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  /**
   * POST /api/products/seed
   * Seed 111 wine products from PDF dataset
   */
  @Post('seed')
  async seed(@Query('force') force?: string) {
    const isForce = force === 'true' || force === '1';
    return this.productsService.seed(isForce);
  }
}
