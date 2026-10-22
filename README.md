# Duy Đinh Profile — quản lý nhạc qua trang quản trị

Website giữ lại trang hồ sơ, hình ảnh, liên kết mạng xã hội và hiệu ứng cũ; trình phát nhạc lấy danh sách từ `data/tracks.json` thông qua Node.js. Trang quản trị cho phép thêm/xóa bài hát, bật phát ngẫu nhiên và tua nhạc bằng thanh tiến trình.

## Yêu cầu
- Node.js 18 trở lên
- npm

## Cài đặt trên Windows
1. Giải nén toàn bộ thư mục dự án.
2. Mở thư mục `duydinh-profile-main` trong VS Code.
3. Mở Terminal tại thư mục đó và chạy:
   ```powershell
   npm install
   ```
4. Sao chép `.env.example` thành `.env`.
   ```powershell
   Copy-Item .env.example .env
   ```
5. Mở `.env`, đổi `ADMIN_PASSWORD` thành mật khẩu riêng và `SESSION_SECRET` thành chuỗi ngẫu nhiên dài. Không chia sẻ file `.env` hoặc đưa file này lên GitHub.
6. Khởi chạy:
   ```powershell
   npm start
   ```
7. Mở website: http://localhost:3000
8. Mở trang quản trị: http://localhost:3000/admin và đăng nhập bằng `ADMIN_PASSWORD` trong `.env`.

## Thêm nhạc
1. Vào `/admin`, đăng nhập.
2. Nhập tên bài hát, nghệ sĩ (nếu có), chọn file nhạc; ảnh bìa là tùy chọn.
3. Nhấn **Thêm bài hát**. File được lưu trong `uploads/music/`, ảnh trong `uploads/covers/`, danh sách được cập nhật trong `data/tracks.json`.
4. Tải lại trang hồ sơ nếu đang mở từ trước. Khi phát, dùng nút xáo trộn để bật/tắt phát ngẫu nhiên và kéo thanh tiến trình để tua.

Các bài nhạc cũ trong `Music/` vẫn được giữ nguyên. Bốn bài hiện tại được khai báo trong `data/tracks.json`; bài thêm từ trang quản trị không cần sửa `Profile.js`.

## Lưu ý triển khai
- Trang quản trị cần chạy qua `node server.js`; mở trực tiếp `index.html` bằng `file://` sẽ không có API.
- Giới hạn tải lên hiện là 30 MB/file. Điều chỉnh trong `server.js` nếu cần.
- Bản này dùng session lưu trong bộ nhớ mặc định của Express, phù hợp chạy local hoặc thử nghiệm; nếu triển khai công khai lâu dài cần session store bền vững, HTTPS, giới hạn đăng nhập và cấu hình bảo mật bổ sung.
- Nếu đưa website lên hosting, thư mục `data/` và `uploads/` cần có quyền ghi và ổ đĩa phải bền vững để dữ liệu không mất sau khi khởi động lại/triển khai lại.
- Không có chức năng thay đổi/xóa hồ sơ hoặc liên kết xã hội trong trang quản trị; các phần đó được giữ nguyên trong `index.html`.
