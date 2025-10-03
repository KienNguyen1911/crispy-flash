# Phase 1: Tách Backend API cho Capacitor

## Tiến trình thực hiện

### 1. Khởi tạo thư mục và cấu hình Express API server
- Tạo thư mục `api-server` trong dự án.
- Khởi tạo `package.json`, `tsconfig.json`, cài đặt các package: `express`, `@prisma/client`, `cors`, `dotenv`, `typescript`, `@types/express`, `@types/node`, `ts-node-dev`.
- Tạo file entrypoint `src/index.ts` với cấu hình cơ bản, middleware xác thực (JWT sẽ bổ sung sau).

### 2. Mapping API routes từ Next.js sang Express
- Đọc các route Next.js hiện tại:
  - `/api/projects` (GET)
  - `/api/projects/:projectId` (GET)
  - `/api/projects/:projectId/topics` (GET)
  - `/api/projects/:projectId/topics/:topicId` (GET)
  - `/api/projects/:projectId/topics/:topicId/vocabulary` (GET)
  - `/api/projects/:projectId/topics/:topicId/vocabulary/:vocabId` (PATCH, DELETE)
- Tạo các file router Express tương ứng, đảm bảo logic kiểm tra quyền sở hữu, trả về dữ liệu giống Next.js API.
- Tối ưu hóa: gom các select, count, trả về dữ liệu lightweight, xử lý lỗi rõ ràng.

### 3. Kết nối Prisma và xác thực
- Sử dụng Prisma Client để truy vấn database giống Next.js.
- Middleware xác thực: hiện tại dùng dummy, sẽ thay bằng JWT sau.

### 4. Tối ưu cấu trúc
- Sử dụng nhiều file router, tách biệt rõ ràng từng resource.
- Mount router vào Express app theo đúng cấu trúc RESTful.

### 5. Tiến độ
- Đã hoàn thành khởi tạo server, mapping các API chính, tối ưu hóa trả về dữ liệu.
- Sẵn sàng cho bước tiếp theo: bổ sung xác thực JWT, thêm các API POST/PATCH cho tạo/sửa dữ liệu.

## Hướng dẫn chạy thử

```bash
cd api-server
npm install
npm run dev
```
Server sẽ chạy tại http://localhost:3001

## TODO tiếp theo
- Bổ sung xác thực JWT (Google OAuth)
- Thêm các API tạo/sửa/xóa (POST/PATCH/DELETE)
- Viết test cho các API
- Tối ưu hóa error handling, logging
- Viết docs cho các endpoint
