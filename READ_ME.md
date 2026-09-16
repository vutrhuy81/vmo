# Hướng Dẫn Cấu Hình Triển Khai Và Kiểm Thử

## Project VMO TST Đà Nẵng 2026–2027

*Áp dụng cho bản V6 đã sửa lỗi    
Phiên bản tài liệu 1.0 • 16/09/2026*

Tài liệu này mô tả cấu trúc, quy trình cài đặt và vận hành project; hướng dẫn chi tiết cách cấu hình Gemini API, Firebase Authentication, Firebase Web API key và Cloud Firestore Security Rules; đồng thời cung cấp bộ test case để nghiệm thu trước khi đưa hệ thống vào sử dụng.

| Thông tin | Giá trị |
| --- | --- |
| Tên project | vmo-tst |
| Nền tảng | Node.js, Express, HTML, CSS, JavaScript |
| Dữ liệu | Cloud Firestore |
| Xác thực | Firebase Authentication với Google |
| AI | Gemini API qua backend |
| Lệnh kiểm tra chuẩn | npm run check |

**Kết luận triển khai:**

Project chỉ nên được đưa lên môi trường thật sau khi hoàn thành ba nhóm cấu hình bắt buộc: đặt hai biến môi trường GEMINI_API_KEY và FIREBASE_WEB_API_KEY trên máy chủ; bật Google Sign-in và khai báo Authorized domains; xuất bản đúng file firestore.rules. Không đưa GEMINI_API_KEY vào firebase-config.js, HTML hoặc JavaScript phía trình duyệt.

## Mục lục nội dung

- 1. Tổng quan và phạm vi project
- 2. Kiến trúc và luồng xử lý
- 3. Yêu cầu môi trường
- 4. Cài đặt và chạy local
- 5. Cấu hình GEMINI_API_KEY
- 6. Cấu hình FIREBASE_WEB_API_KEY
- 7. Cấu hình Firebase Authentication
- 8. Cập nhật firestore.rules
- 9. Cấu hình vai trò quản trị
- 10. Build và triển khai
- 11. Bộ test case
- 12. Xử lý lỗi thường gặp
- 13. Checklist nghiệm thu và bảo mật
- 14. Phụ lục lệnh nhanh và tài liệu tham khảo

## 1 Tổng quan và phạm vi project

VMO TST là ứng dụng web phục vụ ôn luyện học sinh giỏi Toán, tập hợp tài liệu chuyên đề, đề thi thử, 23 kỳ TST và 15 đề lịch sử Đà Nẵng–Quảng Nam. Người dùng đăng nhập bằng Google, xem nội dung, nộp lời giải và yêu cầu AI hướng dẫn hoặc đánh giá. Quản trị viên quản lý tài liệu, đề thi và sự kiện qua Firestore.

| Thành phần | Vai trò | File chính |
| --- | --- | --- |
| Giao diện | Hiển thị nội dung, đăng nhập, nộp bài, quản trị | index.html, login.html, src/, app.js |
| Xác thực | Google Sign-in, phiên người dùng, tự đăng xuất | firebase-config.js, auth.js |
| Dữ liệu | CRUD Firestore và phân quyền | vmo_data_service.js, firestore.rules |
| AI | Tạo hướng dẫn và đánh giá lời giải | server.js, ai_guide_engine.js, vmo_db_ui.js |
| Build | Ghép template và nội dung thành index.html | build.js |
| Test | Cú pháp, build và hồi quy API/nội dung | scripts/, tests/ |

## 2 Kiến trúc và luồng xử lý

### 2.1 Kiến trúc logic

1. Trình duyệt tải giao diện tĩnh và Firebase SDK.
1. Người dùng đăng nhập Google; Firebase trả về ID token.
1. Các thao tác dữ liệu trực tiếp đi tới Firestore và chịu kiểm soát bởi Security Rules.
1. Các thao tác AI gửi ID token tới Express backend.
1. Backend xác minh token qua Firebase Identity Toolkit trước khi gọi Gemini.
1. Gemini API key chỉ tồn tại ở biến môi trường của máy chủ.

### 2.2 Điểm cuối backend

| Method | Endpoint | Mục đích | Yêu cầu |
| --- | --- | --- | --- |
| POST | /api/ai-guide | Sinh hướng dẫn giải | Bearer Firebase ID token |
| POST | /api/ai-evaluate-solution | Đánh giá bài giải văn bản/ảnh | Bearer Firebase ID token |
| GET | /api/* không tồn tại | Trả API_NOT_FOUND | JSON 404 |

Backend áp dụng Helmet, giới hạn 30 yêu cầu AI trong 10 phút trên mỗi địa chỉ IP, giới hạn request body 25 MB và không trả kết quả chấm điểm giả khi Gemini không khả dụng.

## 3 Yêu cầu môi trường

| Hạng mục | Khuyến nghị | Kiểm tra |
| --- | --- | --- |
| Node.js | Bản LTS còn hỗ trợ, tối thiểu Node 18 | node --version |
| npm | Đi kèm Node.js | npm --version |
| Firebase | Quyền quản trị project và Firestore | Đăng nhập Firebase Console |
| Google AI Studio | Quyền tạo Gemini API key | Mở trang API Keys |
| Trình duyệt | Chrome, Edge hoặc Firefox mới | Cho phép popup đăng nhập |

Project dùng ES modules với "type": "module". Không đổi các file server sang CommonJS require/module.exports nếu không có kế hoạch chuyển đổi toàn bộ project.

## 4 Cài đặt và chạy local

1. Giải nén file vmo-tst_15092026_V6_fixed.zip vào một thư mục riêng.
1. Mở Terminal hoặc PowerShell tại thư mục chứa package.json.
1. Cài dependency:

```bash
npm install

```

1. Tạo file .env từ mẫu .env.example. Không commit file .env lên Git.

```dotenv
GEMINI_API_KEY=your_gemini_key
FIREBASE_WEB_API_KEY=your_firebase_web_api_key

```

1. Nạp biến môi trường trước khi chạy. Project hiện đọc trực tiếp process.env; Node không tự nạp .env nếu chưa dùng dotenv.
Windows PowerShell:

```powershell
$env:GEMINI_API_KEY="your_gemini_key"
$env:FIREBASE_WEB_API_KEY="your_firebase_web_api_key"
npm run dev

```

Linux hoặc macOS:

```bash
export GEMINI_API_KEY="your_gemini_key"
export FIREBASE_WEB_API_KEY="your_firebase_web_api_key"
npm run dev

```

1. Mở http://localhost:3000/login.html. Không mở index.html trực tiếp bằng file:// vì popup xác thực và API backend có thể không hoạt động.

## 5 Cấu hình GEMINI_API_KEY

### 5.1 Tạo khóa trong Google AI Studio

1. Đăng nhập Google AI Studio bằng tài khoản có quyền với project Google Cloud cần dùng.
1. Mở Dashboard, chọn Projects. Nếu project chưa xuất hiện, chọn Import projects, tìm project rồi Import.
1. Mở API Keys, chọn Create API key và chọn đúng project.
1. Ưu tiên auth key mới thay cho standard key cũ. Sao chép khóa một lần và lưu trong secret manager hoặc trình quản lý mật khẩu.
1. Nếu đang dùng standard key, áp dụng hạn chế chỉ cho Gemini API; không dùng chung khóa Firebase Browser key.

### 5.2 Khai báo trên môi trường triển khai

**Local:**

```dotenv
GEMINI_API_KEY=<khóa_Gemini>

```

**Vercel:**

1. Mở project trên Vercel.
1. Vào Settings > Environment Variables.
1. Tạo biến GEMINI_API_KEY; dán giá trị khóa.
1. Chọn Production, Preview và Development theo nhu cầu.
1. Redeploy sau khi lưu biến.
**Google Cloud hoặc nền tảng khác:**

Lưu khóa trong Secret Manager hoặc mục Environment Variables của dịch vụ. Không đưa khóa vào firebase-config.js, .env.example, Git, ảnh chụp màn hình hoặc tài liệu công khai.

### 5.3 Kiểm tra Gemini key

- Khởi động server với cả hai biến môi trường.
- Đăng nhập Google thành công.
- Mở một bài toán và chọn AI Hướng dẫn giải.
- Kỳ vọng: API trả HTTP 200 và dữ liệu hướng dẫn. Nếu key thiếu hoặc Gemini lỗi, API phải trả 503 AI_UNAVAILABLE, không tạo điểm giả.

## 6 Cấu hình FIREBASE_WEB_API_KEY

Biến FIREBASE_WEB_API_KEY được backend dùng để gọi Firebase Identity Toolkit accounts:lookup và xác minh Firebase ID token. Giá trị này là trường apiKey trong cấu hình Firebase Web App, không phải Gemini key và không phải service-account private key.

### 6.1 Lấy đúng giá trị

1. Mở Firebase Console và chọn project gen-lang-client-0689542562 hoặc project thay thế của đơn vị.
1. Mở Project settings > General.
1. Trong Your apps, chọn Web app đang dùng. Nếu chưa có, chọn Add app > Web và đăng ký ứng dụng.
1. Tại SDK setup and configuration, chọn Config.
1. Sao chép riêng giá trị apiKey trong firebaseConfig.
1. Đặt giá trị này vào biến môi trường FIREBASE_WEB_API_KEY trên backend.

```dotenv
FIREBASE_WEB_API_KEY=<giá_trị_firebaseConfig.apiKey>

```

### 6.2 Đồng bộ với firebase-config.js

Các trường projectId, appId, apiKey, authDomain, storageBucket, messagingSenderId và firestoreDatabaseId trong firebase-config.js phải cùng thuộc một project/môi trường. Nếu chuyển sang project Firebase khác, cập nhật toàn bộ object firebaseConfig, không chỉ đổi apiKey.

Firebase Web API key có thể xuất hiện trong cấu hình web, nhưng phải được giới hạn cho các API Firebase phù hợp. Quyền truy cập dữ liệu vẫn phải dựa trên Firestore Security Rules và nên bổ sung App Check khi đưa vào production. Tuyệt đối không thêm Generative Language API vào Browser key Firebase.

## 7 Cấu hình Firebase Authentication

### 7.1 Bật Google Sign-in

1. Firebase Console > Authentication > Get started.
1. Mở tab Sign-in method hoặc Sign-in providers.
1. Chọn Google, bật Enable.
1. Chọn Project support email và lưu cấu hình.
1. Kiểm tra OAuth consent screen nếu tổ chức yêu cầu giới hạn người dùng.

### 7.2 Authorized domains

1. Authentication > Settings > Authorized domains.
1. Đảm bảo localhost có trong danh sách để test local.
1. Thêm domain production, ví dụ ten-project.vercel.app hoặc domain riêng.
1. Chỉ thêm domain thực sự sử dụng; không thêm URL có https://, path hoặc port.

### 7.3 Kiểm tra đăng nhập

| Case | Thao tác | Kỳ vọng |
| --- | --- | --- |
| AUTH-01 | Nhấn Đăng nhập Google và chọn tài khoản | Chuyển về index; hiển thị tên người dùng |
| AUTH-02 | Đóng popup trước khi hoàn tất | Hiển thị thông báo popup đã đóng |
| AUTH-03 | Truy cập index khi chưa đăng nhập | Chuyển về login.html |
| AUTH-04 | Đăng xuất | Xóa phiên local/session và về login |

## 8 Cập nhật firestore.rules

File firestore.rules là hàng rào bảo vệ dữ liệu. Không thay bằng quy tắc allow read, write: if true trên môi trường production.

### 8.1 Rà soát trước khi publish

- Đổi email quản trị cứng vutrhuy81@gmail.com nếu người vận hành production là tài khoản khác.
- Xác nhận database ID trong firebase-config.js. Project hiện dùng database có tên ai-studio-vmotst-00387cbe-6cab-4560-b917-c04a2c466643, không nhất thiết là (default).
- Đảm bảo role trong users/{uid} chỉ được admin gán thành admin. Người dùng không được tự nâng role.
- Giữ khóa các trường userId, problemId, score, status và evaluation đối với cập nhật bài nộp của học sinh.

### 8.2 Publish bằng Firebase Console

1. Mở Firebase Console > Firestore Database.
1. Chọn đúng database nếu project có nhiều database.
1. Mở tab Rules.
1. Sao chép toàn bộ nội dung file firestore.rules của bản V6.
1. Chọn Publish.
1. Mở Rules playground để test ít nhất các tình huống trong mục 11.

### 8.3 Publish bằng Firebase CLI

Cách này phù hợp khi quản lý rules bằng Git và CI/CD.

```bash
npm install -g firebase-tools
firebase login
firebase projects:list
firebase use gen-lang-client-0689542562

```

Nếu project chưa có firebase.json, tạo file với cấu hình rules. Với database mặc định:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  }
}

```

Sau đó triển khai:

```bash
firebase deploy --only firestore:rules --project gen-lang-client-0689542562

```

**Lưu ý database có tên:**

Project này khai báo firestoreDatabaseId riêng. Khi dùng CLI, phải xác minh cấu hình target/database theo phiên bản Firebase CLI và cấu trúc project thực tế trước khi deploy; nếu chưa chắc chắn, dùng Firebase Console và chọn đúng database để tránh áp rules nhầm vào (default).

### 8.4 Ý nghĩa quyền chính

| Collection | Đọc | Tạo/Sửa/Xóa |
| --- | --- | --- |
| users | Chính chủ hoặc admin | Chính chủ tạo hồ sơ; không tự đổi role; admin xóa |
| documents | Người đã đăng nhập | Chỉ admin |
| exams | Người đã đăng nhập | Chỉ admin |
| problems | Người đã đăng nhập | Chỉ admin |
| submissions | Chính chủ hoặc admin | Học sinh tạo/sửa nội dung nhưng không đổi điểm/trạng thái/đánh giá; admin toàn quyền |
| events | Người đã đăng nhập | Chỉ admin |

## 9 Cấu hình vai trò quản trị

Quyền admin phía Firestore được xác định bởi email quản trị trong hàm isAdmin hoặc trường role=admin trong users/{uid}. Giao diện chỉ là lớp hiển thị; Firestore Rules mới là cơ chế quyết định quyền thực sự.

1. Đăng nhập một lần bằng tài khoản quản trị để tạo users/{uid}.
1. Trong Firebase Console > Firestore > users, mở document có ID đúng Firebase UID.
1. Đặt role thành admin. Không dùng username hoặc email làm document ID nếu code đang dùng UID.
1. Đăng xuất và đăng nhập lại để phiên nhận vai trò mới.
1. Kiểm tra Database Hub xuất hiện và thao tác tạo tài liệu thành công.
**Khuyến nghị production:**

Không duy trì email admin cứng lâu dài. Nên dùng Firebase custom claims hoặc quy trình quản trị vai trò chỉ có backend đặc quyền mới cập nhật được.

## 10 Build và triển khai

### 10.1 Các lệnh chuẩn

| Lệnh | Tác dụng |
| --- | --- |
| npm run dev | Chạy Express tại cổng 3000 |
| npm run build | Ghép src/template.html và các module thành index.html |
| npm run lint | Kiểm tra cú pháp toàn bộ file JS/MJS |
| npm test | Chạy test hồi quy bằng Node test runner |
| npm run check | Lint + build + test; dùng trước mỗi lần phát hành |

### 10.2 Quy trình phát hành

1. Chạy npm install trên môi trường sạch.
1. Chạy npm run check và yêu cầu 100% test pass.
1. Kiểm tra GEMINI_API_KEY và FIREBASE_WEB_API_KEY trên môi trường đích.
1. Publish firestore.rules và xác nhận đúng database.
1. Deploy code; sau đó redeploy nếu vừa thay đổi environment variables.
1. Thực hiện smoke test đăng nhập, đọc Firestore, AI guide, AI evaluate và quyền admin.
1. Theo dõi log backend, quota Gemini, Firebase Authentication và Firestore usage.

## 11 Bộ test case

### 11.1 Test tự động hiện có

| ID | Nội dung | Kỳ vọng |
| --- | --- | --- |
| AUTO-01 | Không còn admin/123456 trong auth.js | Pass |
| AUTO-02 | Đếm nội dung: 23 TST và 15 đề lịch sử | Pass |
| AUTO-03 | POST /api/ai-guide không token | 401 AUTH_REQUIRED |
| AUTO-04 | API không tồn tại | 404 application/json |
| AUTO-05 | JSON sai cú pháp | 400 BAD_REQUEST, không có stack |

```bash
npm run check

```

Kết quả chuẩn của bản V6: Syntax OK, build thành công và 5/5 test pass.

### 11.2 Test cấu hình và tích hợp

| ID | Tiền điều kiện và bước test | Kết quả mong đợi |
| --- | --- | --- |
| CFG-01 | Bỏ GEMINI_API_KEY; đăng nhập và gọi AI | 503 AI_UNAVAILABLE; không sinh đánh giá giả |
| CFG-02 | Bỏ FIREBASE_WEB_API_KEY; gửi token hợp lệ | 503 AUTH_NOT_CONFIGURED |
| CFG-03 | Gửi Bearer token giả | 401 INVALID_TOKEN hoặc lỗi xác thực tương ứng |
| CFG-04 | Dùng Firebase Web key đúng project | Token hợp lệ được xác minh; request đi tiếp |
| CFG-05 | Gọi AI quá 30 lần/10 phút/IP | 429 RATE_LIMITED |
| CFG-06 | Gửi JSON không hợp lệ | 400 BAD_REQUEST; không lộ stack |
| CFG-07 | Gửi payload vượt 25 MB | 413 PAYLOAD_TOO_LARGE |
| CFG-08 | Gọi /api/unknown | 404 API_NOT_FOUND dạng JSON |

### 11.3 Test Firestore Rules

| ID | Người dùng | Thao tác | Kỳ vọng |
| --- | --- | --- | --- |
| FS-01 | Ẩn danh | Đọc documents | Deny |
| FS-02 | Đã đăng nhập | Đọc documents/exams/problems/events | Allow |
| FS-03 | Học sinh | Tạo submission với userId=UID của mình | Allow |
| FS-04 | Học sinh | Tạo submission với userId người khác | Deny |
| FS-05 | Học sinh | Sửa solutionContent của bài mình | Allow nếu trường khóa giữ nguyên |
| FS-06 | Học sinh | Đổi score/status/evaluation | Deny |
| FS-07 | Học sinh | Sửa/xóa document hoặc exam | Deny |
| FS-08 | Admin | Tạo/sửa/xóa nội dung hệ thống | Allow |
| FS-09 | Người dùng | Tự đổi role thành admin | Deny |
| FS-10 | Chính chủ | Đọc bài nộp của mình | Allow |

### 11.4 Test giao diện và nghiệp vụ

| ID | Kịch bản | Kết quả mong đợi |
| --- | --- | --- |
| UI-01 | Desktop và mobile mở trang chính | Không tràn ngang; tab và menu sử dụng được |
| UI-02 | Chuyển VI/EN | Nội dung giao diện đổi ngôn ngữ, không mất trạng thái |
| UI-03 | Tìm kiếm và lọc đề | Kết quả và bộ đếm chính xác |
| UI-04 | Nộp lời giải văn bản | Lưu Firestore đúng UID/problemId |
| UI-05 | Nộp ảnh PNG/JPEG/WebP hợp lệ | Preview và gửi đánh giá thành công |
| UI-06 | Tải loại file không hỗ trợ/ảnh quá lớn | Bị từ chối với thông báo rõ ràng |
| UI-07 | Người thường mở Database Hub | Nút ẩn hoặc bị từ chối; Firestore vẫn deny |
| UI-08 | Dữ liệu chứa <script> hoặc thuộc tính onerror | Hiển thị như văn bản, không thực thi script |
| UI-09 | Gemini timeout/quá tải | Thông báo lỗi thật; có thể thử lại; không chấm giả |
| UI-10 | Phiên không hoạt động quá thời hạn | Tự đăng xuất và quay về login |

### 11.5 Mẫu biên bản test

| ID | Ngày test | Môi trường | Kết quả | Bằng chứng/Ghi chú |
| --- | --- | --- | --- | --- |
| TC-01 | ____/____/______ | Local / Preview / Prod | Pass / Fail |  |
| TC-02 | ____/____/______ | Local / Preview / Prod | Pass / Fail |  |
| TC-03 | ____/____/______ | Local / Preview / Prod | Pass / Fail |  |
| TC-04 | ____/____/______ | Local / Preview / Prod | Pass / Fail |  |
| TC-05 | ____/____/______ | Local / Preview / Prod | Pass / Fail |  |
| TC-06 | ____/____/______ | Local / Preview / Prod | Pass / Fail |  |
| TC-07 | ____/____/______ | Local / Preview / Prod | Pass / Fail |  |
| TC-08 | ____/____/______ | Local / Preview / Prod | Pass / Fail |  |

## 12 Xử lý lỗi thường gặp

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
| --- | --- | --- |
| 401 AUTH_REQUIRED | Client không gửi ID token | Đăng nhập lại; kiểm tra getCurrentUser và Authorization Bearer |
| 401 INVALID_TOKEN | Token hết hạn/sai project | Lấy token mới; đảm bảo frontend và backend dùng cùng Firebase project |
| 503 AUTH_NOT_CONFIGURED | Thiếu FIREBASE_WEB_API_KEY | Tạo biến môi trường và redeploy |
| 503 AI_UNAVAILABLE | Thiếu/sai Gemini key hoặc model quá tải | Kiểm tra key, quota, billing, log và trạng thái dịch vụ |
| auth/unauthorized-domain | Domain chưa được cấp phép | Thêm host vào Authorized domains |
| Missing or insufficient permissions | Rules deny hoặc role/UID sai | Kiểm tra database, document UID, role và rules đã publish |
| API_KEY_SERVICE_BLOCKED hoặc 403 | Firebase key bị giới hạn thiếu API cần thiết | Rà soát API restrictions của Browser key |
| Popup bị chặn | Trình duyệt chặn cửa sổ Google | Cho phép popup hoặc thử lại thao tác người dùng |
| npm run check thiếu script | Đang dùng nhầm bản cũ/package.json cũ | Dùng đúng ZIP V6 và kiểm tra package.json |
| Thay nội dung src nhưng index không đổi | Chưa build | Chạy npm run build trước khi deploy |

## 13 Checklist nghiệm thu và bảo mật

- [ ] Không có GEMINI_API_KEY trong Git, HTML, JavaScript phía client hoặc log.
- [ ] GEMINI_API_KEY là auth key hoặc khóa đã giới hạn đúng Gemini API.
- [ ] FIREBASE_WEB_API_KEY đúng project và không dùng chung với Gemini.
- [ ] Google Sign-in đã bật; localhost và domain production đã được cấp phép.
- [ ] firestore.rules bản V6 đã publish vào đúng database.
- [ ] Email admin cứng đã được rà soát/thay thế; role admin chỉ cấp cho đúng UID.
- [ ] npm run check đạt 100%; kiểm thử thủ công Auth, AI, Firestore và UI đạt.
- [ ] API ẩn danh bị chặn; rate limit và lỗi JSON hoạt động đúng.
- [ ] Bật billing alert/quota alert và theo dõi log bất thường.
- [ ] Có kế hoạch rotate Gemini key và thu hồi khóa khi nghi ngờ rò rỉ.
- [ ] Môi trường test và production dùng project/keys/database tách biệt nếu có thể.
- [ ] Đã cân nhắc Firebase App Check cho production.

## 14 Phụ lục lệnh nhanh và tài liệu tham khảo

### 14.1 Lệnh nhanh

```bash
npm install
npm run check
npm run dev

```

```bash
# Linux/macOS
export GEMINI_API_KEY="..."
export FIREBASE_WEB_API_KEY="..."
npm run dev

```

```powershell
# Windows PowerShell
$env:GEMINI_API_KEY="..."
$env:FIREBASE_WEB_API_KEY="..."
npm run dev

```

### 14.2 Tài liệu chính thức

[Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)

[Firebase Google Sign-in for Web](https://firebase.google.com/docs/auth/web/google-signin)

[Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

[Firebase CLI](https://firebase.google.com/docs/cli)

[Firebase API key management](https://firebase.google.com/docs/projects/api-keys)

Tài liệu được xây dựng theo cấu trúc và hành vi của bản project V6. Khi thay đổi project Firebase, database ID, phương thức xác thực, model Gemini hoặc nền tảng hosting, cần cập nhật lại các bước cấu hình và chạy lại toàn bộ bộ test case.
