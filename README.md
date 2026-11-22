# 🚀 API Common — Proxy Seeding & Background Runner System

> Hệ thống quản trị và dịch vụ API tập trung (`api-common.tikat.vn`): Tự động hóa kiểm tra chuyển hướng liên kết, xoay vòng Proxy SOCKS5/SOCKS5H độc lập 24/7, tracking affiliate redirect, giả lập trình duyệt và thiết bị thật, lưu trữ dữ liệu MongoDB Atlas và tài liệu Swagger chuẩn OpenAPI.

---

## 🌟 Tính Năng Nổi Bật

### 1. Proxy Seeding & Background Auto Runner 24/7 (Độc Lập & Bất Đồng Bộ)
* **Chạy ngầm 24/7 độc lập trên Server**: Tiến trình chạy trực tiếp trên server NestJS, duy trì hoạt động liên tục ngay cả khi người dùng tắt trình duyệt hay ngắt kết nối dashboard.
* **Đếm ngược riêng biệt cho từng URL (Không chờ nhau)**: Mỗi URL trong danh sách được cấp một bộ hẹn giờ độc lập. Các URL chạy song song theo khoảng thời gian delay ngẫu nhiên (`minDelaySec` – `maxDelaySec`) mà không phải xếp hàng chờ đợi nhau.
* **Hỗ trợ SOCKS5 & SOCKS5H**: Hỗ trợ đầy đủ proxy có xác thực (`socks5h://user:pass@host:port`) với cơ chế giải mã DNS từ xa qua proxy, đảm bảo IP đầu ra luôn ẩn danh và an toàn tuyệt đối.
* **Xoay Proxy & Tra Cứu Vị Trí IP**: Tự động tra cứu vị trí địa lý, ISP và IP đầu ra thực tế của proxy sau mỗi lượt chạy.
* **Giải Mã Chuỗi Redirect Đa Tầng**: Phân tích toàn bộ chuỗi chuyển hướng (HTTP 301, 302, 307, 308, Meta Refresh, Header `x-redirect-url`), trích xuất chính xác URL đích cuối cùng (`finalUrl`) và các tham số tracking affiliate (`aff_sid`, `atnct1`, `utm_*`).
* **Mô Phỏng Thiết Bị & Trình Duyệt Thật**: Luân phiên ngẫu nhiên User-Agent thật của Chrome, Safari, Edge, Firefox trên Desktop (Windows, macOS) và Mobile (iOS, Android) kèm đầy đủ Client Hints, Referer & Cookie Engine.

### 2. Quản Trị & Lưu Trữ Dữ Liệu Tập Trung (MongoDB Atlas)
* **Lưu trữ Persistent 100% trên Cloud**: Mọi cấu hình (delay min/max, proxy mặc định), danh sách URL tự động và lịch sử chạy đều được lưu trực tiếp vào MongoDB Atlas.
* **Tự Động Dọn Dẹp Lịch Sử Sau 3 Ngày**: Áp dụng cơ chế MongoDB TTL Index (`expireAfterSeconds: 259200`), tự động xóa các bản ghi lịch sử cũ quá 3 ngày để tối ưu hóa bộ nhớ và hiệu năng.
* **Đồng bộ Realtime**: Thống kê số lượt chạy của từng dòng và tổng số lượt chạy luôn được tính toán đồng bộ, chính xác tuyệt đối giữa Frontend và Backend.

### 3. Giao Diện Quản Trị Độc Lập (Next.js 14 App Router)
* **Dashboard Trung Tâm (`/dashboard`)**:
  * Form cấu hình URL, khoảng thời gian ngẫu nhiên (kèm nút chọn nhanh 30s-60s, 60s-180s, 120s-240s, 5p-10p) và Proxy SOCKS5.
  * Danh sách URL đang chạy với trạng thái bật/tắt trực tiếp cho từng dòng, bộ đếm ngược giây realtime, số lượt chạy và nút test nhanh `⚡ Test ngay`.
  * Xem kết quả lượt chạy gần nhất: IP đầu ra, thiết bị giả lập, kiểu redirect, URL đích và bảng phân tích tham số tracking.
* **Trang Lịch Sử Chuyên Dụng (`/dashboard/history`)**:
  * Bảng theo dõi toàn bộ lịch sử chạy proxy với bộ lọc theo trạng thái (Tất cả, Thành công HTTP 200, Chuyển hướng 3xx, Lỗi 4xx/5xx).
  * Tìm kiếm nhanh theo URL đích, IP, vị trí địa lý hoặc mã Tracking `aff_sid`.
  * Chức năng sao chép thông tin nhanh và xóa toàn bộ lịch sử khi cần.
* **Hỗ Trợ Ứng Dụng PWA (Progressive Web App)**:
  * Cài đặt trực tiếp lên điện thoại (Android qua Chrome, iOS qua Safari "Thêm vào MH chính") và máy tính Desktop.
  * Chạy ở chế độ Standalone toàn màn hình, mượt mà như ứng dụng native với biểu tượng và Service Worker hỗ trợ cache.
* **Tự Động Điều Hướng**: Cấu hình chuyển hướng HTTP 307 từ `/`, `/admin`, `/admin/proxy` về `/dashboard` và `/admin/proxy/history` về `/dashboard/history`.

### 4. Tài Liệu Swagger API Chuẩn Hóa (`/api/docs`)
* Tích hợp Swagger UI trực quan tại `/api/docs` và file JSON tại `/api/docs-json`.
* Đầy đủ mô tả các DTO schemas, request payload, response schemas và mã lỗi HTTP cho toàn bộ API Proxy Seeding.

---

## 🏗️ Kiến Trúc Hệ Thống

```text
api-common.tikat.vn/
├── Backend/                         # NestJS API Backend (Port 5001)
│   ├── src/
│   │   ├── proxy-seeding/           # Module cốt lõi: Proxy Seeding & Background Runner
│   │   │   ├── proxy-seeding.module.ts       # Controller, Module & Swagger DTOs
│   │   │   ├── proxy-seeding.service.ts      # Engine thực thi request qua SOCKS5 & theo dõi redirect
│   │   │   ├── proxy-auto-runner.service.ts  # Background scheduler độc lập cho từng URL (MongoDB)
│   │   │   └── schemas/                      # Mongoose Schemas (Task, Config, History có TTL)
│   │   ├── products/                # Module phụ trợ quản lý sản phẩm
│   │   ├── cloudinary/              # Module tích hợp Cloudinary Media
│   │   ├── swagger/                 # Cấu hình Swagger UI & CDN Cache Headers
│   │   ├── app.module.ts            # AppModule kết nối trực tiếp MongoDB Atlas
│   │   └── main.ts                  # Bootstrap server NestJS, Global Prefix & Swagger
│   ├── package.json
│   └── .env
├── Frontend/                        # Next.js 14 App Router Dashboard (Port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/           # Trang Dashboard quản trị chính
│   │   │   │   ├── page.tsx         # Giao diện Proxy Seeding & Background Runner
│   │   │   │   ├── layout.tsx       # Sidebar Dashboard (Điều hướng, link Swagger)
│   │   │   │   └── history/         # Trang Lịch sử chi tiết (/dashboard/history)
│   │   │   ├── manifest.ts          # Cấu hình PWA Web Manifest chuẩn Next.js
│   │   │   ├── sitemap.ts           # Sitemap chuẩn SEO
│   │   │   ├── robots.ts            # Robots.txt
│   │   │   └── layout.tsx           # Root Layout (SEO Meta, Favicon, PWA Register)
│   │   ├── components/
│   │   │   └── PWARegister.tsx      # Component đăng ký Service Worker & banner cài PWA
│   │   └── lib/
│   │       ├── api.ts               # API Client giao tiếp Backend NestJS
│   │       └── proxyHistory.ts      # Helpers xử lý dữ liệu lịch sử
│   ├── public/
│   │   ├── icons/                   # Bộ icon PWA đa kích thước (32, 192, 512)
│   │   ├── favicon.ico              # Favicon đa kích thước cho Chrome/Edge/Safari
│   │   ├── icon.svg                 # Vector Icon hiện đại
│   │   ├── apple-touch-icon.png     # Icon ứng dụng iOS
│   │   ├── manifest.json            # Web Manifest dự phòng cho trình duyệt cũ
│   │   └── sw.js                    # Service Worker hỗ trợ cài PWA & caching
│   ├── next.config.mjs              # Redirects HTTP 307
│   ├── package.json
│   └── .env.local
└── README.md
```

---

## 📡 Danh Sách API Endpoints (Proxy Seeding)

| Phương thức | Đường dẫn API | Mô tả chi tiết |
| :--- | :--- | :--- |
| `POST` | `/api/proxy-seeding/run` | Chạy kiểm tra 1 URL đơn lẻ qua Proxy SOCKS5 (trả về IP, vị trí, chuỗi redirect) |
| `GET` | `/api/proxy-seeding/auto-run/status` | Lấy trạng thái tiến trình chạy ngầm: `isRunning`, `totalRuns`, thời gian delay, số lượng task |
| `GET` | `/api/proxy-seeding/auto-run/tasks` | Lấy danh sách các URL chạy tự động kèm thời gian đếm ngược riêng biệt |
| `POST` | `/api/proxy-seeding/auto-run/start` | Kích hoạt tiến trình chạy ngầm Backend 24/7 (hỗ trợ kèm task mới hoặc cập nhật delay) |
| `POST` | `/api/proxy-seeding/auto-run/stop` | Tạm dừng toàn bộ các URL đang chạy ngầm |
| `POST` | `/api/proxy-seeding/auto-run/tasks` | Thêm URL mới vào danh sách chạy tự động |
| `PATCH` | `/api/proxy-seeding/auto-run/tasks/:id/toggle` | Bật / Tạm dừng chạy ngầm độc lập cho 1 URL cụ thể |
| `DELETE` | `/api/proxy-seeding/auto-run/tasks/:id` | Xóa 1 URL khỏi danh sách chạy tự động |
| `GET` | `/api/proxy-seeding/history` | Lấy danh sách toàn bộ lịch sử chạy proxy từ MongoDB Atlas |
| `DELETE` | `/api/proxy-seeding/history` | Xóa sạch toàn bộ lịch sử chạy proxy trong cơ sở dữ liệu |
| `GET` | `/api/proxy-seeding/config` | Xem thông số cấu hình proxy mặc định và thời gian delay |
| `POST` | `/api/proxy-seeding/config` | Cập nhật proxy mặc định hệ thống và khoảng thời gian delay ngẫu nhiên |
| `GET` | `/api/docs` | Giao diện tài liệu Swagger UI |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local)

### Yêu Cầu Môi Trường
* **Node.js**: >= 18.x
* **NPM**: >= 9.x
* Tài khoản **MongoDB Atlas** (hoặc MongoDB server cục bộ)

---

### Bước 1: Khởi động Backend (NestJS - Port 5001)

```bash
cd Backend

# 1. Cài đặt thư viện
npm install

# 2. Cấu hình biến môi trường
cp .env.example .env
```

Mở file `Backend/.env` và thiết lập các thông số:
```env
PORT=5001
DB_mongo=mongodb+srv://<username>:<password>@cluster0.jbohbqd.mongodb.net
DB_NAME=ruou_db
CLOUDINARY_URL="cloudinary://..."
```

> ⚠️ **Lưu ý quan trọng về MongoDB Atlas**: Hãy đảm bảo bạn đã thêm IP mạng hiện tại của bạn (hoặc `0.0.0.0/0`) vào mục **Security $\rightarrow$ Network Access** trên MongoDB Atlas để máy local có thể kết nối thành công.

```bash
# 3. Khởi chạy Backend ở chế độ Watch
npm run start:dev
```
* Backend API: `http://localhost:5001/api`
* Swagger Docs: `http://localhost:5001/api/docs`

---

### Bước 2: Khởi động Frontend Dashboard (Next.js 14 - Port 3000)

```bash
cd Frontend

# 1. Cài đặt thư viện
npm install

# 2. Cấu hình biến môi trường
cp .env.example .env.local
```

Mở file `Frontend/.env.local`:
```env
# Kết nối tới Backend cục bộ (hoặc trỏ tới Production Render: https://project-ruou.onrender.com/api)
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
# 3. Khởi chạy Frontend
npm run dev
```
* Dashboard quản trị: `http://localhost:3000/dashboard`
* Lịch sử Seeding: `http://localhost:3000/dashboard/history`

---

## 🌐 Triển Khai Thực Tế (Production Deployment)

* **Backend (Render / Railway / VPS Docker)**:
  * Build command: `npm run build`
  * Start command: `npm run start:prod`
  * Cung cấp các biến môi trường: `DB_mongo`, `DB_NAME`, `PORT=5001`, `CLOUDINARY_URL`.
* **Frontend (Vercel)**:
  * Framework Preset: `Next.js`
  * Root Directory: `Frontend`
  * Environment Variables:
    * `NEXT_PUBLIC_API_URL`: `https://project-ruou.onrender.com/api`
    * `NEXT_PUBLIC_SITE_URL`: `https://api-common.vercel.app`

---

## 📜 Giấy Phép & Bản Quyền
Dự án được xây dựng và duy trì bởi **Tien Nguyen** ([@tiennguyen2507](https://github.com/tiennguyen2507)).  
Mã nguồn phát triển riêng cho hệ thống **API Common** (`api-common.tikat.vn`).
