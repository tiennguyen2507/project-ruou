# 🍷 Rượu Tốt — Vang Huy Phong (E-Commerce & Wine Management System)

Hệ thống website thương mại điện tử và trang quản trị phân phối rượu vang nhập khẩu chính hãng cao cấp, lấy cảm hứng và chuẩn giao diện thương hiệu **RƯỢU TỐT** (`ruoutot.net`), kết hợp dữ liệu niêm yết từ **Bảng Báo Giá 2026 — Công ty Cổ phần Huy Phong**.

---

## 🌟 Tính Năng Nổi Bật

### 1. Khách Hàng & Bán Lẻ (Frontend - Next.js 14)
* **Giao diện chuẩn Rượu Tốt**: Tông màu đỏ đô `#b30000`, thanh điều hướng, banner sự kiện, tìm kiếm gợi ý thông minh và thẻ sản phẩm chi tiết.
* **111+ Dòng Vang Nhập Khẩu**: Vang Pháp (Bordeaux, Burgundy, Graves...), Vang Ý (Primitivo, Chianti...), Vang Chile (Reserva Carmenere...), Tây Ban Nha, Úc, Vang Sủi & Vang 0.0% Alcohol.
* **Tra Cứu Bảng Báo Giá 2026**: Trang tra cứu PDF và danh mục giá thùng/giá chai niêm yết theo chuẩn catalogue Huy Phong.
* **Giỏ Hàng & Đặt Hàng**: Ngăn kéo giỏ hàng (Cart Drawer), tính toán chiết khấu, áp mã ưu đãi và đặt hàng nhanh.
* **Modal Xác Minh Độ Tuổi 18+**: Tuân thủ nghiêm ngặt Nghị định 24/2020/NĐ-CP đối với đồ uống có cồn.

### 2. Trang Quản Trị Hệ Thống (Admin Dashboard - `/admin`)
* **Thống Kê Trực Quan (Metrics)**: Tổng sản phẩm, tồn kho, sản phẩm hết hàng, số lượng ảnh lưu trữ Cloudinary, ước tính tổng giá trị kho.
* **Bộ Lọc & Tìm Kiếm Đa Tiêu Chí**: Tìm kiếm nhanh theo Tên, SKU, Thương hiệu, Giống nho, Quốc gia, Loại vang và Tồn kho.
* **Chỉnh Sửa Toàn Diện (Full Edit Modal)**: Cập nhật giá bán, giá niêm yết, % giảm giá, niên vụ, dung tích, nồng độ cồn, ghi chú nếm thử (Tasting Notes), món ăn kèm (Food pairings).
* **Quản Lý Tồn Kho Nhanh**: Bật/tắt trạng thái Còn hàng / Hết hàng ngay trên bảng dữ liệu với 1 cú click.

### 3. Tích Hợp & Tối Ưu Hình Ảnh Cloudinary Tự Động
* **Thư mục chuyên dụng**: Toàn bộ hình ảnh tải lên được lưu trữ tập trung tại folder `ruoutot_products`.
* **Tự động tối ưu dung lượng & định dạng**: Tự động chuyển đổi định dạng WebP/AVIF (`fetch_format: auto`) và nén thông minh (`quality: auto:good`).
* **Tự động xóa ảnh cũ khi cập nhật**: Khi tải ảnh mới lên cho một chai rượu, hệ thống tự động gọi API Cloudinary xóa vĩnh viễn ảnh cũ nhằm tiết kiệm dung lượng tài khoản.
* **Tự động xóa ảnh khi xóa sản phẩm**: Khi xóa sản phẩm khỏi cơ sở dữ liệu, file ảnh tương ứng trên Cloudinary cũng bị xóa sạch sẽ.

---

## 🏗️ Kiến Trúc Hệ Thống

```text
project-ruou/
├── Backend/                    # NestJS API Backend (Port 5001)
│   ├── src/
│   │   ├── cloudinary/         # Cloudinary Module (Upload, destroy, auto-optimization)
│   │   ├── products/           # Products Controller, Service, Schema & DTOs
│   │   ├── database/           # MongoDB / In-memory Fallback Database Service
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── .env.example
├── Frontend/                   # Next.js 14 App Router (Port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/          # Trang Quản trị Dashboard
│   │   │   ├── san-pham/       # Trang danh mục & chi tiết rượu vang
│   │   │   ├── bao-gia-2026/   # Tra cứu bảng giá PDF 2026
│   │   │   └── page.tsx        # Trang chủ Rượu Tốt
│   │   ├── components/         # Header, Footer, Modals, Product Cards
│   │   ├── data/               # Dữ liệu 111 sản phẩm gốc từ PDF
│   │   └── lib/                # API client & Utilities
│   ├── package.json
│   └── .env.example
├── BAO GIA 2026 - SHOP 170826.pdf
├── README.md
└── .gitignore
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu Cầu Môi Trường
* **Node.js**: >= 18.x
* **NPM** hoặc **Yarn**

---

### Bước 1: Khởi động Backend (NestJS)

```bash
cd Backend

# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Thiết lập biến môi trường
cp .env.example .env
# Điền thông tin CLOUDINARY_URL và MongoDB (nếu có) vào .env

# 3. Khởi chạy server Backend
npm run start:dev
```
> Server Backend sẽ lắng nghe tại: `http://localhost:5001/api`  
> *Lưu ý: Nếu không kết nối được MongoDB Atlas, hệ thống tự động khởi chạy MongoDB In-Memory Server và nạp sẵn 111 sản phẩm gốc.*

---

### Bước 2: Khởi động Frontend (Next.js 14)

```bash
cd Frontend

# 1. Cài đặt dependencies
npm install

# 2. Thiết lập biến môi trường
cp .env.example .env.local

# 3. Khởi chạy server phát triển
npm run dev
```
> Website sẽ chạy tại: `http://localhost:3000`  
> Trang Quản trị: `http://localhost:3000/admin`

---

## 📡 Danh Sách API Endpoints Chính

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Lấy danh sách sản phẩm (tìm kiếm, lọc theo nước, loại, giá, phân trang) |
| `GET` | `/api/products/:id` | Xem chi tiết sản phẩm theo MongoDB ID / SKU / Slug |
| `POST` | `/api/products` | Tạo mới sản phẩm |
| `PATCH` | `/api/products/:id` | Cập nhật thông tin sản phẩm |
| `POST` | `/api/products/:id/upload-image` | Tải ảnh lên Cloudinary `ruoutot_products` & tự xóa ảnh cũ |
| `DELETE` | `/api/products/:id` | Xóa sản phẩm & tự động xóa vĩnh viễn ảnh trên Cloudinary |
| `POST` | `/api/products/seed` | Đồng bộ lại 111 sản phẩm gốc từ Bảng Báo Giá Huy Phong 2026 |

---

## 📜 Bản Quyền & Giấy Phép
Dự án được xây dựng và phát triển bởi [Tien Nguyen](https://github.com/tiennguyen2507).
Dữ liệu sản phẩm thuộc bản quyền Công ty Cổ phần Huy Phong.

