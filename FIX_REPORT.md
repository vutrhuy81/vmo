# Báo cáo sửa lỗi V6

## Đã sửa

- Xóa tài khoản quản trị/mật khẩu mặc định và vô hiệu hóa đăng nhập cục bộ.
- Bắt buộc Firebase ID token với API AI; thêm giới hạn 30 yêu cầu/10 phút/IP.
- Không còn trả kết quả chấm điểm giả khi Gemini lỗi hoặc chưa cấu hình.
- Chuẩn hóa phản hồi JSON cho API không tồn tại, JSON lỗi và payload quá lớn; không lộ stack trace.
- Bổ sung Helmet, bỏ header nhận diện Express, chặn truy cập bản HTML sao lưu cũ.
- Khóa các trường điểm, trạng thái và đánh giá trong Firestore đối với học sinh.
- Bổ sung token cho các lời gọi AI phía trình duyệt và escape nội dung do AI/người dùng cung cấp.
- Vô hiệu hóa API MongoDB/auth cũ không tương thích ESM.
- Sửa thống kê nội dung thành 23 kỳ TST và 15 đề lịch sử (9 Đà Nẵng, 6 Quảng Nam).
- Bổ sung bộ kiểm thử hồi quy và kiểm tra cú pháp toàn bộ JavaScript.

## Cấu hình triển khai bắt buộc

Thiết lập `GEMINI_API_KEY` và `FIREBASE_WEB_API_KEY` trên môi trường máy chủ. Triển khai lại `firestore.rules` trước khi mở ứng dụng cho người dùng.

## Kiểm thử

Chạy `npm install` rồi `npm run check`. Bộ kiểm thử kiểm tra tài khoản mặc định, số lượng nội dung, xác thực API, API 404 JSON và xử lý JSON sai không lộ stack.
