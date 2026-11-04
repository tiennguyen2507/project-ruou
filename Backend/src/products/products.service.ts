import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ProductsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Auto-seed products on initial application startup if collection is empty
   */
  async onApplicationBootstrap() {
    try {
      const count = await this.productModel.countDocuments().exec();
      if (count === 0) {
        this.logger.log(
          'Kho dữ liệu đang trống. Đang tự động nạp 111 sản phẩm từ Báo Giá 2026...',
        );
        await this.seed(false);
      } else {
        this.logger.log(
          `Kho dữ liệu đang có ${count} sản phẩm rượu vang sẵn sàng phục vụ.`,
        );
      }
    } catch (e: any) {
      this.logger.warn(`Không thể tự động nạp dữ liệu ban đầu: ${e.message}`);
    }
  }

  /**
   * Find products with filtering, search, sorting and pagination
   */
  async findAll(query: QueryProductDto) {
    const {
      q,
      country,
      wineType,
      region,
      brand,
      minPrice,
      maxPrice,
      sortBy,
      page = 1,
      limit = 20,
    } = query;

    const filter: Record<string, any> = {};

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { originalName: searchRegex },
        { brand: searchRegex },
        { region: searchRegex },
        { grapes: searchRegex },
        { sku: searchRegex },
      ];
    }

    if (country && country !== 'all') {
      filter.country = country;
    }

    if (wineType && wineType !== 'all') {
      filter.wineType = new RegExp(wineType, 'i');
    }

    if (region && region !== 'all') {
      filter.region = new RegExp(region, 'i');
    }

    if (brand && brand !== 'all') {
      filter.brand = new RegExp(brand, 'i');
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // Sort options
    let sortObj: Record<string, any> = { createdAt: -1 };
    if (sortBy === 'price_asc') {
      sortObj = { price: 1 };
    } else if (sortBy === 'price_desc') {
      sortObj = { price: -1 };
    } else if (sortBy === 'discount') {
      sortObj = { discountPercent: -1 };
    } else if (sortBy === 'rating') {
      sortObj = { rating: -1 };
    } else if (sortBy === 'newest') {
      sortObj = { createdAt: -1 };
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      success: true,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a product by ID, SKU, or Slug
   */
  async findOne(identifier: string): Promise<ProductDocument> {
    let product: ProductDocument | null = null;

    if (isValidObjectId(identifier)) {
      product = await this.productModel.findById(identifier).exec();
    }

    if (!product) {
      product = await this.productModel
        .findOne({
          $or: [{ slug: identifier }, { sku: identifier }],
        })
        .exec();
    }

    if (!product) {
      throw new NotFoundException(
        `Không tìm thấy sản phẩm với định danh: ${identifier}`,
      );
    }

    return product;
  }

  /**
   * Find product specifically by slug
   */
  async findBySlug(slug: string): Promise<ProductDocument> {
    const product = await this.productModel.findOne({ slug }).exec();
    if (!product) {
      throw new NotFoundException(
        `Không tìm thấy sản phẩm với slug: ${slug}`,
      );
    }
    return product;
  }

  /**
   * Create a new product
   */
  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    // Check duplicate SKU or Slug
    const existing = await this.productModel
      .findOne({
        $or: [
          { sku: createProductDto.sku },
          { slug: createProductDto.slug },
        ],
      })
      .exec();

    if (existing) {
      throw new ConflictException(
        `Sản phẩm với SKU (${createProductDto.sku}) hoặc Slug (${createProductDto.slug}) đã tồn tại.`,
      );
    }

    const createdProduct = new this.productModel(createProductDto);
    return await createdProduct.save();
  }

  /**
   * UPDATE PRODUCT (Cập nhật sản phẩm)
   * Supports updating by MongoDB _id, SKU, or Slug
   * Automatically deletes old image on Cloudinary if replaced
   */
  async update(
    identifier: string,
    updateProductDto: UpdateProductDto,
  ): Promise<{ success: boolean; message: string; product: ProductDocument }> {
    // Find existing product first
    const existingProduct = await this.findOne(identifier);

    // Check if new SKU or slug would conflict with another product
    if (updateProductDto.sku || updateProductDto.slug) {
      const conflictFilter: any = {
        _id: { $ne: existingProduct._id },
        $or: [
          ...(updateProductDto.sku ? [{ sku: updateProductDto.sku }] : []),
          ...(updateProductDto.slug ? [{ slug: updateProductDto.slug }] : []),
        ],
      };

      const conflict = await this.productModel.findOne(conflictFilter).exec();
      if (conflict) {
        throw new ConflictException(
          `SKU (${updateProductDto.sku}) hoặc Slug (${updateProductDto.slug}) đã thuộc về sản phẩm khác.`,
        );
      }
    }

    // Auto recalculate discountPercent if price & originalPrice are provided
    if (updateProductDto.price && updateProductDto.originalPrice) {
      if (updateProductDto.originalPrice > updateProductDto.price) {
        updateProductDto.discountPercent = Math.round(
          ((updateProductDto.originalPrice - updateProductDto.price) /
            updateProductDto.originalPrice) *
            100,
        );
      }
    }

    // If new image or new Cloudinary Public ID is provided, delete the old image on Cloudinary
    if (
      updateProductDto.cloudinaryPublicId &&
      existingProduct.cloudinaryPublicId &&
      updateProductDto.cloudinaryPublicId !== existingProduct.cloudinaryPublicId
    ) {
      await this.cloudinaryService.deleteImage(existingProduct.cloudinaryPublicId);
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        existingProduct._id,
        { $set: updateProductDto },
        { new: true },
      )
      .exec();

    this.logger.log(`Updated product: ${updatedProduct.name} (${updatedProduct.sku})`);

    return {
      success: true,
      message: `Cập nhật thông tin sản phẩm '${updatedProduct.name}' thành công!`,
      product: updatedProduct,
    };
  }

  /**
   * Upload / Update Product Image directly via Cloudinary
   * Automatically deletes the previous image on Cloudinary
   */
  async uploadProductImage(
    identifier: string,
    file: Express.Multer.File,
  ): Promise<{ success: boolean; message: string; product: ProductDocument }> {
    const product = await this.findOne(identifier);

    // 1. Upload new image to Cloudinary in folder 'ruoutot_products'
    const uploadResult = await this.cloudinaryService.uploadImage(file);

    // 2. If product had an old Cloudinary image, delete it
    if (product.cloudinaryPublicId) {
      await this.cloudinaryService.deleteImage(product.cloudinaryPublicId);
    }

    // 3. Update product with new secure URL and public ID
    product.image = uploadResult.secure_url;
    product.cloudinaryPublicId = uploadResult.public_id;
    await product.save();

    this.logger.log(
      `Product '${product.name}' image updated on Cloudinary: ${uploadResult.public_id}`,
    );

    return {
      success: true,
      message: `Đã cập nhật ảnh sản phẩm '${product.name}' lên Cloudinary thành công!`,
      product,
    };
  }

  /**
   * Upload image directly to Cloudinary without binding to a product yet
   */
  async uploadStandaloneImage(file: Express.Multer.File) {
    return this.cloudinaryService.uploadImage(file);
  }

  /**
   * Delete a product
   * Automatically deletes associated image on Cloudinary
   */
  async remove(identifier: string): Promise<{ success: boolean; message: string }> {
    const product = await this.findOne(identifier);

    // 1. If product has an image on Cloudinary, delete it
    if (product.cloudinaryPublicId) {
      await this.cloudinaryService.deleteImage(product.cloudinaryPublicId);
    }

    // 2. Remove product from database
    await this.productModel.findByIdAndDelete(product._id).exec();

    this.logger.log(
      `Deleted product '${product.name}' and removed Cloudinary asset: ${product.cloudinaryPublicId}`,
    );

    return {
      success: true,
      message: `Đã xóa sản phẩm '${product.name}' (${product.sku}) và dọn dẹp ảnh Cloudinary thành công!`,
    };
  }

  /**
   * Seed / Sync products from Frontend/src/data/products.json
   */
  async seed(force = false): Promise<{ count: number; message: string }> {
    const count = await this.productModel.countDocuments().exec();
    if (count > 0 && !force) {
      return {
        count,
        message: `Database đã có ${count} sản phẩm. Không cần seed lại (dùng force=true nếu muốn ghi đè).`,
      };
    }

    const potentialPaths = [
      path.resolve(__dirname, '../data/products.json'),
      path.resolve(process.cwd(), 'src/data/products.json'),
      path.resolve(process.cwd(), 'dist/data/products.json'),
      path.resolve(__dirname, '../../../../Frontend/src/data/products.json'),
      path.resolve(process.cwd(), '../Frontend/src/data/products.json'),
    ];

    let jsonPath = '';
    for (const p of potentialPaths) {
      if (fs.existsSync(p)) {
        jsonPath = p;
        break;
      }
    }

    if (!jsonPath) {
      throw new NotFoundException(
        `Không tìm thấy file products.json để nạp dữ liệu.`,
      );
    }

    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    const products: any[] = JSON.parse(fileContent);

    const cleaned = products.map((p) => {
      const { id, _id, ...rest } = p;
      return rest;
    });

    if (force) {
      await this.productModel.deleteMany({}).exec();
    }

    const inserted = await this.productModel.insertMany(cleaned, {
      ordered: false,
    });

    this.logger.log(`Seeded ${inserted.length} wine products into MongoDB!`);

    return {
      count: inserted.length,
      message: `Đã nạp thành công ${inserted.length} sản phẩm rượu vang vào MongoDB!`,
    };
  }
}
