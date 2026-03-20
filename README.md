# Hệ thống Tra cứu Hồ sơ Nhân sự Đại biểu Quốc hội

Đây là một ứng dụng web tĩnh được thiết kế để đọc và hiển thị dữ liệu từ file Excel (`.xlsx`) ngay trên trình duyệt mà không cần máy chủ (server). Ứng dụng cung cấp giao diện trực quan, chuyên nghiệp theo phong cách cơ quan nhà nước, kèm theo tính năng tìm kiếm và phân trang tiện lợi.

## Tính năng nổi bật
- **Đọc file nội bộ**: Sử dụng thư viện SheetJS để parse dữ liệu Excel hoàn toàn ở phía client. Dữ liệu không bị gửi lên hay lưu trữ ở bất kỳ máy chủ nào.
- **Tìm kiếm toàn năng**: Tìm kiếm nhanh chóng trên mọi trường thông tin của đại biểu.
- **Giao diện tương tác**: Thiết kế "chính thống" thân thiện, sử dụng tông màu Quốc hội (Đỏ/Vàng đồng), tương thích trên máy tính và thiết bị di động.
- **Chi tiết hồ sơ**: Xem thông tin chi tiết từng đại biểu thông qua modal thao tác mượt mà.

## Công nghệ sử dụng
- **HTML5, CSS3, Vanilla JavaScript**: Nhẹ, load siêu tốc, dễ bảo trì.
- **[SheetJS (XLSX)](https://sheetjs.com/)**: Thư viện xử lý và đọc nội dung file Excel trực tiếp trên trình duyệt.
- **[FontAwesome](https://fontawesome.com/)**: Hiển thị icon rõ nét.
- **Google Fonts (Inter)**: Font chữ hiện đại, rõ ràng.

## Hướng dẫn sử dụng (Local Development)

Vì đây là ứng dụng web tĩnh 100% (Static Web App), bạn không cần cài đặt Node.js, Python hay setup môi trường build phức tạp.

### Cài đặt và Chạy:
1. **Clone dự án về máy:**
   ```bash
   git clone <your-repository-url>
   cd <repository-name>
   ```
2. **Khởi chạy ứng dụng:**
   - **Cách đơn giản nhất**: Click đúp vào file `index.html` để mở bằng trình duyệt (Chrome, Safari, Edge).
   - **Dành cho Developer**: Nên mở dự án trong VSCode và sử dụng extension **Live Server** để tự động reload trang mỗi khi code thay đổi.

### Hướng dẫn nhập dữ liệu:
1. Mở trang web `index.html`.
2. Tại màn hình chính, nhấp vào nút **"Chọn File Upload"**.
3. Chọn file Excel `ho_so_nhan_su.xlsx` có chứa dữ liệu trên máy tính của bạn.
4. Bảng danh sách sẽ ngay lập tức được tạo tự động với đầy đủ các cột và hàng dữ liệu tương ứng trong file Excel.

## Triển khai (Deployment trên GitHub Pages)
Dự án không có quy trình build (`build step` / `package.json`), do vậy có thể triển khai lên **GitHub Pages** chỉ qua vài thao tác click:
1. Commit và push toàn bộ code (ngoại trừ file `.xlsx`) lên branch `main` của repository GitHub.
2. Tại trang repo GitHub, vào **Settings** > **Pages**.
3. Ở mục **Source**, chọn `Deploy from a branch`. Phía dưới mục Branch, chọn `main` và `/ (root)`.
4. Nhấn **Save**. Quá trình deploy sẽ hoàn tất trong 1-2 phút và bạn sẽ nhận được một đường link URL công khai truy cập được mọi nơi.

## Lưu ý về Bảo vệ Dữ liệu
- **Không chứa API Keys**: Toàn bộ mã nguồn đã được quét, không chứa bất kỳ secret keys, password, hay cấu hình hardcode nào. Dự án không kết nối tới Database ngoài.
- **File Gitignore**: File `.gitignore` đã được định cấu hình để loại trừ tự động các tệp tin Excel, ngăn chặn việc commit nhầm hồ sơ nhạy cảm lên môi trường public.
