# PinkChat - Giao Diện Chat Kỷ Niệm CGV (Duy Lâm 🐶)

Giao diện web chat tông màu hồng tối giản, hiệu ứng bo tròn góc mềm mại, hiển thị hình nền kỷ niệm sắc nét và tích hợp nhạc nền bài hát "Phép Màu" (Chạm Music Box) cùng hệ thống trí tuệ cảm xúc phản hồi chân thật của bạn trai Duy Lâm.

---

## 🚀 Hướng Dẫn Đưa Lên GitHub Pages Chạy Trực Tiếp

Toàn bộ mã nguồn đã được cấu hình đường dẫn tương đối (`base: './'`) và xuất sẵn bản tĩnh tĩnh hoàn chỉnh (HTML, CSS, JS, Audio, Hình ảnh) vào thư mục `docs/` và `dist/`.

Bạn có thể đưa lên GitHub Pages chạy ngay lập tức theo 1 trong các cách sau:

### Cách 1: Sử dụng thư mục `/docs` (Đơn giản & Nhanh nhất - Không cần cài đặt gì thêm)
1. Đẩy toàn bộ mã nguồn của dự án này lên repository GitHub của bạn (nhánh `main`).
2. Trên trang repository GitHub, vào mục **Settings** (Cài đặt) -> chọn **Pages** ở thanh bên trái.
3. Ở phần **Build and deployment**:
   - **Source**: Chọn `Deploy from a branch`
   - **Branch**: Chọn nhánh `main` và chọn thư mục `/docs`
   - Bấm **Save** (Lưu).
4. Đợi khoảng 1 - 2 phút, GitHub Pages sẽ tạo đường link trang web dạng:
   `https://<tên-tài-khoản-github>.github.io/<tên-repo>/`

---

### Cách 2: Sử dụng các tệp trong thư mục `dist/` làm thư mục gốc (Root)
Nếu bạn muốn dùng nhánh riêng `gh-pages` hoặc copy trực tiếp các tệp vào thư mục gốc của repository:
1. Bạn chỉ cần copy toàn bộ nội dung bên trong thư mục `dist/` (bao gồm `index.html`, thư mục `assets/`, `.nojekyll`) ra ngoài thư mục gốc của repo.
2. Vào **Settings** -> **Pages** -> chọn nhánh `main` (hoặc `gh-pages`) với thư mục `/ (root)`.
3. Bấm **Save**. Trang web sẽ hoạt động ngay lập tức.

---

### Cách 3: Tự build lại bằng lệnh nếu bạn chỉnh sửa code React
Nếu bạn chỉnh sửa các tệp TypeScript trong `src/`:
```bash
npm install
npm run build
```
Lệnh này sẽ tự động đóng gói toàn bộ HTML, CSS và JavaScript mới nhất vào thư mục `dist/` với đường dẫn tương đối chuẩn cho GitHub Pages. Sau đó copy sang thư mục `docs/`:
```bash
rm -rf docs && cp -r dist docs && touch docs/.nojekyll
```

---

## ✨ Tính Năng Nổi Bật Đã Tích Hợp
- **Hình nền kỷ niệm**: Hiển thị trọn vẹn, sắc nét, có nút chuyển đổi vừa khung (Contain) hoặc tràn viền (Cover).
- **Nhạc nền Phép Màu**: Điều khiển phát/dừng, thanh âm lượng và bảng cài đặt âm thanh có cấu trúc.
- **Hệ thống AI Bạn Trai Duy Lâm**:
  - Gõ chậm rãi, có khoảng dừng đọc tin và thời gian soạn tin thực tế (3.5s - 8s).
  - Tự động phản hồi chăm sóc chu đáo khi đau đầu, đau tay, mất ngủ, bỏ bữa.
  - Phản hồi câu "Em nhớ anh" / "Muốn gặp anh": *"Anh cũng đang nhớ em nè, tối mình gặp nhau em nhé! ❤️"*.
  - Hiệu ứng rung nhẹ (shake animation) và rung haptic khi Gâu Gâu gửi tin nhắn đến.
  - Tự động thả chùm tim bay khi có tin nhắn yêu thương.
