# RƯỢU TỐT - BACKEND (NESTJS & MONGODB)

Hệ thống Backend xây dựng bằng **NestJS 10**, **TypeScript**, và **Mongoose (MongoDB)** để quản lý, truy vấn và cập nhật sản phẩm rượu vang cho website Rượu Tốt - Vang Huy Phong.

---

## 1. Cấu trúc thư mục

```
Backend/
├── .env                              # Cấu hình biến môi trường & MongoDB
├── src/
│   ├── main.ts                       # Entry point, cấu hình CORS, global prefix (/api), validation
│   ├── app.module.ts                 # AppModule kết nối Mongoose & nạp ConfigModule
│   └── products/
│       ├── products.module.ts        # Module quản lý sản phẩm
│       ├── products.controller.ts    # REST API endpoints (GET, POST, PATCH, PUT, DELETE, SEED)
│       ├── products.service.ts       # Nghiệp vụ tìm kiếm, lọc, cập nhật sản phẩm & auto-seed
│       ├── schemas/
│       │   └── product.schema.ts     # Schema Mongoose đầy đủ 30+ trường rượu vang
│       └── dto/
│           ├── create-product.dto.ts # DTO tạo mới sản phẩm
│           ├── update-product.dto.ts # DTO cập nhật sản phẩm (hỗ trợ update từng phần)
│           └── query-product.dto.ts  # DTO tìm kiếm, lọc, phân trang
└── package.json
```

---

## 2. Cấu hình biến môi trường (`.env`)

```env
DB_mongo=mongodb+srv://haphuongcksp96_db_user:haphuongcksp96_db_user@cluster0.jbohbqd.mongodb.net
PORT=5001
DB_NAME=ruou_db
CORS_ORIGIN=http://localhost:3000
```

> **Lưu ý về MongoDB Atlas:**
> Khi kết nối tới MongoDB Atlas, hãy đảm bảo:
> 1. Tài khoản `haphuongcksp96_db_user` có quyền đọc/ghi trong mục **Database Access** của Atlas.
> 2. Đã thêm IP của bạn (hoặc `0.0.0.0/0`) trong mục **Network Access** -> **IP Access List** trên MongoDB Atlas.
> *(Hệ thống được tích hợp cơ chế tự động chuyển sang MongoDB dự phòng nếu phát hiện sai mật khẩu Atlas để server không bao giờ bị dừng).*

---

## 3. Các API cập nhật và quản lý sản phẩm

Prefix gốc của API: `http://localhost:5001/api`

### 3.1. Cập nhật sản phẩm (`PATCH /api/products/:id` hoặc `PUT /api/products/:id`)
Tham số `:id` có thể truyền một trong ba loại định danh:
- **MongoDB ID:** Ví dụ `6aeb33f429a8dff399e65064`
- **Mã SKU:** Ví dụ `HP-CL-CARM01`
- **Slug sản phẩm:** Ví dụ `ruou-vang-chile-reserva-de-familia-carmenere`

#### Ví dụ 1: Cập nhật giá bán, số lượng tồn kho và nhãn khuyến mãi
```bash
curl -X PATCH "http://localhost:5001/api/products/ruou-vang-chile-reserva-de-familia-carmenere" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 650000,
    "stockCount": 85,
    "badge": "Siêu Ưu Đãi"
  }'
```

#### Ví dụ 2: Cập nhật thông số kỹ thuật (độ cồn, nhiệt độ phục vụ)
```bash
curl -X PATCH "http://localhost:5001/api/products/HP-CL-CARM01" \
  -H "Content-Type: application/json" \
  -d '{
    "alcohol": "15%",
    "alcoholNumeric": 15.0,
    "servingTemp": "16 - 18°C",
    "inStock": true
  }'
```

---

### 3.2. Lấy danh sách sản phẩm (`GET /api/products`)
Hỗ trợ tìm kiếm từ khóa, lọc theo quốc gia, loại vang, vùng nho, khoảng giá, và sắp xếp:
```bash
# Tìm kiếm sản phẩm
curl "http://localhost:5001/api/products?q=Carmenere"

# Lọc vang Chile giá từ 400.000đ đến 1.000.000đ
curl "http://localhost:5001/api/products?country=Chile&minPrice=400000&maxPrice=1000000"

# Sắp xếp theo giá tăng dần
curl "http://localhost:5001/api/products?sortBy=price_asc&limit=10"
```

---

### 3.3. Xem chi tiết sản phẩm (`GET /api/products/:id`)
```bash
# Theo Slug
curl "http://localhost:5001/api/products/slug/ruou-vang-chile-reserva-de-familia-carmenere"

# Theo SKU
curl "http://localhost:5001/api/products/HP-CL-CARM01"
```

---

### 3.4. Thêm sản phẩm mới (`POST /api/products`)
```bash
curl -X POST "http://localhost:5001/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "HP-NEW-01",
    "name": "Rượu Vang Đỏ Cao Cấp 2026",
    "slug": "ruou-vang-do-cao-cap-2026",
    "country": "Ý",
    "wineType": "Vang Đỏ",
    "price": 890000,
    "originalPrice": 1150000,
    "volume": "750ml",
    "alcohol": "14.5%",
    "inStock": true,
    "stockCount": 50
  }'
```

---

### 3.5. Xóa sản phẩm (`DELETE /api/products/:id`)
```bash
curl -X DELETE "http://localhost:5001/api/products/HP-NEW-01"
```

---

### 3.6. Đồng bộ / Nạp 111 sản phẩm từ file PDF Báo Giá 2026 (`POST /api/products/seed`)
```bash
# Nạp dữ liệu mặc định (nếu rỗng)
curl -X POST "http://localhost:5001/api/products/seed"

# Nạp đè toàn bộ lại từ đầu
curl -X POST "http://localhost:5001/api/products/seed?force=true"
```

---

## 4. Cách khởi chạy dự án

```bash
cd Backend

# Chạy ở chế độ Development (tự reload khi đổi code)
npm run start:dev

# Build ứng dụng
npm run build

# Chạy bản Production
npm run start:prod
```


## 5. API ảnh dùng chung và Swagger

API ảnh hoạt động độc lập với sản phẩm, có thể sử dụng từ các ứng dụng khác.
Ảnh được lưu trên Cloudinary trong thư mục do trường `folder` chỉ định (mặc định `common_images`); API trả metadata để
ứng dụng gọi lưu URL và `public_id` vào dữ liệu của mình, không tạo bản ghi MongoDB riêng.

Cấu hình trong `Backend/.env` (không đưa secret vào frontend):

```env
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

Sau khi chạy `npm install` và `npm run start:dev` trong `Backend`:

- Swagger UI: http://localhost:5001/api/docs
- OpenAPI JSON: http://localhost:5001/api/docs-json
- `POST /api/images`: multipart form, trường `file` bắt buộc, `folder` tuỳ chọn (tối đa 255 ký tự, ví dụ `banners` hoặc `products/wine`; để trống dùng `common_images`). JPEG, PNG, WebP, GIF; tối đa 5 MiB. Kiểm tra MIME và chữ ký file; Cloudinary kiểm tra giải mã ảnh.
- `DELETE /api/images`: JSON `{ "publicId": "common_images/abc123" }`. Dùng nguyên `public_id` trả về khi upload, bao gồm thư mục, không dùng URL ảnh.

```bash
curl -X POST http://localhost:5001/api/images \
  -F 'file=@/path/to/image.jpg'

curl -X DELETE http://localhost:5001/api/images \
  -H 'Content-Type: application/json' \
  -d '{"publicId":"common_images/abc123"}'
```

Upload trả `201` với `{ success: true, data: { secure_url, public_id, format, bytes } }`.
Xoá trả `200` với `{ success: true, data: { public_id, deleted: true } }` và yêu cầu
Cloudinary vô hiệu hoá cache CDN. Ảnh đã xoá/không tồn tại trả `404`.
Lỗi dữ liệu trả `400`, file quá lớn trả `413`, thiếu cấu hình trả `503`, lỗi Cloudinary trả `502`.
Các endpoint này sử dụng cùng chính sách truy cập hiện tại của backend (chưa có xác thực).
API ảnh sản phẩm hiện tại vẫn có trong nhóm Products trên Swagger.

Kiểm tra API với Cloudinary giả lập (không cần MongoDB hoặc tài khoản Cloudinary):

```bash
npm run test:images
```
