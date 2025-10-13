# PWA Setup for LinguaFlash

## Tính năng PWA đã được cài đặt

### 1. Web App Manifest
- File: `/public/manifest.json`
- Đã cấu hình với thông tin ứng dụng đầy đủ
- Hỗ trợ cài đặt trên iOS và Android

### 2. Service Worker
- File: `/public/sw.js`
- Hỗ trợ caching và offline functionality
- Tự động cache các assets quan trọng

### 3. Offline Page
- Route: `/offline`
- Hiển thị khi người dùng offline
- Có nút thử lại để refresh

### 4. PWA Install Components
- **PWAInstall** (`/src/components/PWAInstall.tsx`): Tự động hiển thị popup cài đặt khi khả dụng
- **PWAiOSInstall** (`/src/components/PWAiOSInstall.tsx`): Hướng dẫn cài đặt cho iOS Safari
- **PWADesktopInstall** (`/src/components/PWADesktopInstall.tsx`): Hướng dẫn cài đặt cho desktop

## Cách sử dụng

### Cài đặt trên thiết bị di động:

1. **Android (Chrome)**:
   - Mở trang web trên Chrome
   - **Popup tự động**: Sẽ xuất hiện popup cài đặt ở góc dưới phải
   - **Cài đặt thủ công**: Nhấn nút ba chấm (⋮) → "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính"

2. **iOS (Safari)**:
   - Mở trang web trên Safari
   - **Hướng dẫn tự động**: Sẽ xuất hiện banner hướng dẫn ở góc dưới phải
   - **Cài đặt thủ công**: Nhấn nút "Chia sẻ" (share button) → Chọn "Thêm vào màn hình chính"

### Test PWA:

### 1. Trang Test PWA:
   - Truy cập: `http://localhost:3000/pwa-test`
   - Kiểm tra trạng thái Service Worker, Manifest, Installable
   - Xem thông tin thiết bị và debug tips

### 2. Test offline**:
   - Mở Developer Tools (F12)
   - Vào tab Network
   - Chọn "Offline" để test trang offline

### 3. Test cài đặt**:
   - **Mobile**: Mở trang web trên thiết bị di động
     - Popup cài đặt sẽ tự động xuất hiện ở góc dưới phải
     - Nếu không thấy popup, kiểm tra console để debug
   - **Desktop**: Mở trang web trên desktop
     - Nhấn nút ba chấm (⋮) trong trình duyệt → tìm "Cài đặt LinguaFlash"
     - Hoặc sẽ có popup hướng dẫn cài đặt thủ công

## Cấu hình thêm (tùy chọn)

### Thay đổi màu sắc:
- Chỉnh sửa `theme_color` và `background_color` trong `/public/manifest.json`
- Cập nhật màu trong `/src/app/layout.tsx`

### Thay đổi icon:
- Thay thế các file SVG trong `/public/icons/`
- Đảm bảo giữ nguyên kích thước và định dạng

### Thêm chức năng offline:
- Mở rộng caching trong `/public/sw.js`
- Thêm các route cần cache vào mảng `urlsToCache`

## Troubleshooting

### PWA không cài đặt được:
1. Kiểm tra HTTPS (PWA yêu cầu HTTPS)
2. Kiểm tra manifest.json hợp lệ
3. Kiểm tra service worker được đăng ký

### Icon không hiển thị:
1. Kiểm tra đường dẫn icon trong manifest.json
2. Kiểm tra kích thước icon (192x192 và 512x512)
3. Kiểm tra định dạng file (PNG hoặc SVG)