# 🎬 GIỚI THIỆU ỨNG DỤNG – TODO LIST APP
### Bài tập JavaScript – Báo cáo Video

> **Sinh viên:** Trương Văn Ý  
> **Môn học:** JavaScript  
> **Ngày báo cáo:** 21/02/2026  
> **GitHub:** https://github.com/truongvany/todo_app

---

## 📌 PHẦN 1 – GIỚI THIỆU ỨNG DỤNG

### Ứng dụng là gì?

**Todo List App** là một ứng dụng quản lý công việc cá nhân (To-Do List) được xây dựng bằng Node.js và MongoDB. Ứng dụng cho phép người dùng:

- Đăng ký / đăng nhập tài khoản
- Tạo, xem, xóa, cập nhật công việc
- Phân loại theo độ ưu tiên (Cao / Trung bình / Thấp)
- Theo dõi tiến độ hoàn thành công việc

---

## 🛠️ PHẦN 2 – CÔNG NGHỆ SỬ DỤNG

| Thành phần | Công nghệ | Vai trò |
|------------|-----------|---------|
| **Backend** | Node.js + Express.js | Xử lý logic, điều hướng API |
| **Database** | MongoDB + Mongoose | Lưu trữ dữ liệu người dùng và công việc |
| **Template Engine** | EJS | Render giao diện HTML phía server |
| **Giao diện** | Bootstrap 5 + CSS tùy chỉnh | Thiết kế UI responsive |
| **Bảo mật** | bcryptjs | Mã hóa mật khẩu người dùng |
| **Session** | express-session | Quản lý phiên đăng nhập |
| **Test API** | Postman | Kiểm thử các endpoint |

### Sơ đồ kiến trúc

```
┌──────────────────┐      HTTP       ┌─────────────────────┐
│  Trình duyệt /   │ ─────────────► │   Express.js Server  │
│  Postman         │ ◄───────────── │   (localhost:3000)   │
└──────────────────┘   JSON / HTML   └──────────┬──────────┘
                                                 │ Mongoose
                                                 ▼
                                       ┌─────────────────┐
                                       │    MongoDB       │
                                       │  ┌───────────┐  │
                                       │  │  users    │  │
                                       │  │  tasks    │  │
                                       │  └───────────┘  │
                                       └─────────────────┘
```

---

## 📂 PHẦN 3 – CẤU TRÚC DỰ ÁN

```
TODO_LIST/
├── backend/                  ← Server Node.js
│   ├── server.js             ← Điểm khởi chạy
│   ├── app.js                ← Cấu hình Express
│   ├── config/
│   │   └── database.js       ← Kết nối MongoDB
│   ├── models/
│   │   ├── User.js           ← Schema người dùng (có bcrypt)
│   │   └── Task.js           ← Schema công việc
│   ├── routes/
│   │   ├── userRoutes.js     ← API /api/users/*
│   │   ├── taskRoutes.js     ← API /api/tasks/*
│   │   └── viewRoutes.js     ← Giao diện web /
│   └── middleware/
│       └── auth.js           ← Kiểm tra xác thực
│
├── frontend/
│   ├── views/                ← Giao diện EJS
│   │   ├── index.ejs         ← Trang chủ (danh sách task)
│   │   ├── login.ejs         ← Trang đăng nhập
│   │   ├── register.ejs      ← Trang đăng ký
│   │   └── partials/
│   │       ├── header.ejs    ← Navbar dùng chung
│   │       └── footer.ejs    ← Footer + Bootstrap JS
│   └── public/css/
│       └── style.css         ← CSS tùy chỉnh
│
├── API_DOCUMENT.md           ← Tài liệu API đầy đủ
├── TodoList_Level1.postman_collection.json   ← File test Postman
└── PRESENTATION.md           ← File này
```

---

## ✅ PHẦN 4 – CÁC TÍNH NĂNG ĐÃ THỰC HIỆN

### LEVEL 1 – REST API

#### Yêu cầu 1: Mã hóa mật khẩu (bcryptjs)

```
Người dùng nhập: "123456"
                    │
                    ▼  bcrypt.hash(password, 10)
Lưu vào DB:  "$2a$10$N9qo8uLOickgx2ZMRZoM..."
```

- File: `backend/models/User.js`
- Cơ chế: **pre-save hook** – tự động chạy trước khi lưu
- Xác thực: `bcrypt.compare(plainText, hash)` khi đăng nhập
- Mật khẩu **KHÔNG BAO GIỜ** trả về trong response JSON

#### Yêu cầu 2: Username duy nhất

- Schema có `unique: true` trên trường `username`
- Server kiểm tra trùng, trả về lỗi `400` nếu đã tồn tại
- Mongoose Index tự động đảm bảo tính toàn vẹn ở tầng DB

#### Yêu cầu 3: 1 task = 1 user

- Task có trường `createdBy` (ObjectId, ref User)
- Khi tạo task → chỉ lưu `createdBy: userId`
- **Không có** danh sách assignees ở Level 1

---

### DANH SÁCH API ĐÃ XÂY DỰNG

#### 👤 API Người dùng (`/api/users`)

| # | Method | Endpoint | Chức năng |
|---|--------|----------|-----------|
| 1 | POST | `/api/users/register` | Đăng ký (password tự hash) |
| 2 | POST | `/api/users/login` | Đăng nhập (bcrypt verify) |
| 3 | POST | `/api/users/logout` | Đăng xuất |
| 4 | GET | `/api/users/all` | Lấy tất cả users |
| 5 | GET | `/api/users/nguyen` | Users có họ Nguyễn |
| 6 | GET | `/api/users/:id` | Lấy user theo ID |
| 7 | PUT | `/api/users/:id` | Cập nhật user |
| 8 | DELETE | `/api/users/:id` | Xóa user |

#### 📋 API Công việc (`/api/tasks`)

| # | Method | Endpoint | Chức năng |
|---|--------|----------|-----------|
| 1 | GET | `/api/tasks/all` | **getAllTasks** – Lấy tất cả task |
| 2 | POST | `/api/tasks/create` | Tạo task mới (gắn với 1 user) |
| 3 | GET | `/api/tasks/by-username/:username` | Task theo tên đăng nhập |
| 4 | GET | `/api/tasks/today` | Task trong ngày hôm nay |
| 5 | GET | `/api/tasks/incomplete` | Task chưa hoàn thành |
| 6 | GET | `/api/tasks/by-nguyen` | Task của user họ Nguyễn |
| 7 | GET | `/api/tasks/:id` | Chi tiết 1 task |
| 8 | PUT | `/api/tasks/:id` | Cập nhật task |
| 9 | DELETE | `/api/tasks/:id` | Xóa task |

---

## 🎥 PHẦN 5 – KỊCH BẢN DEMO VIDEO

> Gợi ý thứ tự thực hiện khi quay màn hình

---

### 🔷 BƯỚC 1 – Khởi động ứng dụng (30 giây)

```bash
# Mở terminal, gõ lệnh:
cd backend
npm start
```

**Nói:** *"Chạy lệnh `npm start`, server khởi động tại cổng 3000, kết nối MongoDB thành công."*

Màn hình xuất hiện:
```
╔════════════════════════════════════════════╗
║       🔧 TODO LIST BACKEND API             ║
╠════════════════════════════════════════════╣
║  Server:  http://localhost:3000            ║
╚════════════════════════════════════════════╝
```

---

### 🔷 BƯỚC 2 – Mở Postman, giới thiệu Collection (30 giây)

1. Mở **Postman** → Import file `TodoList_Level1.postman_collection.json`
2. Giới thiệu cấu trúc 2 nhóm: **👤 Users** và **📋 Tasks - Level 1**
3. Chỉ vào biến `{{baseUrl}}` = `http://localhost:3000`

**Nói:** *"Tôi đã chuẩn bị sẵn 17 request trong Postman để demo tất cả các API."*

---

### 🔷 BƯỚC 3 – Demo Đăng ký & Mã hóa mật khẩu (1 phút)

**Request #1 – Đăng ký user**

```json
POST /api/users/register
{
  "username":  "nguyenvana",
  "password":  "123456",
  "firstName": "Nguyễn",
  "lastName":  "Văn A"
}
```

➜ Response trả về `201`, **không có trường `password`**

**Nói:** *"Mật khẩu '123456' được bcryptjs mã hóa thành chuỗi hash trước khi lưu vào database. Trong response không bao giờ trả về mật khẩu."*

**➜ Mở MongoDB Compass** (hoặc terminal) chỉ trường `password` trong DB:

```
password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVujxcVXJq"
```

---

### 🔷 BƯỚC 4 – Demo Username duy nhất (30 giây)

**Request #4 – Đăng ký trùng username**

```json
POST /api/users/register
{ "username": "nguyenvana", ... }
```

➜ Response trả về `400 Bad Request`:
```json
{ "success": false, "message": "Username đã tồn tại" }
```

**Nói:** *"Hệ thống kiểm tra trùng username và trả về lỗi 400 với thông báo rõ ràng."*

---

### 🔷 BƯỚC 5 – Demo Đăng nhập (30 giây)

**Request #5 – Đăng nhập đúng**

```json
POST /api/users/login
{ "username": "nguyenvana", "password": "123456" }
```
➜ `200 OK`, trả về thông tin user

**Request #6 – Đăng nhập sai mật khẩu**
```json
{ "username": "nguyenvana", "password": "saimatkhau" }
```
➜ `401 Unauthorized`

**Nói:** *"bcrypt.compare() so sánh mật khẩu gõ vào với chuỗi hash trong DB, không cần giải mã."*

---

### 🔷 BƯỚC 6 – Demo tạo Task (1 phút)

Trước tiên tạo thêm 2 user (request #2, #3):
- `nguyenthib` – họ **Nguyễn**
- `tranvanc` – họ **Trần** (để đối chiếu)

**Request #8 – Tạo task**
```json
POST /api/tasks/create
{
  "title":    "Học Node.js",
  "userId":   "{{userId}}",
  "priority": "high"
}
```
➜ Response có `createdBy` là thông tin user, **không có assignees**

**Nói:** *"Ở Level 1, mỗi task chỉ thuộc về 1 user duy nhất thông qua trường `createdBy`. Đây là điểm khác biệt so với Level 3 sẽ có nhiều người được giao task."*

Tạo thêm task cho nguyenthib (#9) và tranvanc (#10).

---

### 🔷 BƯỚC 7 – Demo getAllTasks (30 giây)

**Request #11**
```
GET /api/tasks/all
```
➜ Trả về danh sách tất cả task, kèm thông tin người tạo

**Nói:** *"API getAllTasks trả về toàn bộ danh sách công việc, mỗi task đều có thông tin người tạo được populate từ collection users."*

---

### 🔷 BƯỚC 8 – Demo lấy task theo username (30 giây)

**Request #12**
```
GET /api/tasks/by-username/nguyenvana
```
➜ Chỉ trả về task của `nguyenvana`

**Request #13** – username không tồn tại
```
GET /api/tasks/by-username/userkhongtontai
```
➜ `404 Not Found`

---

### 🔷 BƯỚC 9 – Demo task hôm nay & chưa xong (30 giây)

**Request #14 – Task hôm nay**
```
GET /api/tasks/today
```
➜ Trả về ngày `21/02/2026`, danh sách task tạo hôm nay

**Request #15 – Task chưa hoàn thành**
```
GET /api/tasks/incomplete
```
➜ Chỉ trả về task có `status != "completed"`

---

### 🔷 BƯỚC 10 – Demo task của user họ Nguyễn (30 giây)

**Request #16**
```
GET /api/tasks/by-nguyen
```
➜ Trả về task của `nguyenvana` và `nguyenthib`  
➜ **Không có** task của `tranvanc` (họ Trần)

**Nói:** *"Hệ thống dùng MongoDB Regex tìm tất cả user có firstName = 'Nguyễn' (không phân biệt hoa thường), sau đó lấy task của những user đó."*

---

### 🔷 BƯỚC 11 – Giới thiệu giao diện Web (1 phút)

Mở trình duyệt vào `http://localhost:3000`

**Các điểm cần giới thiệu:**
1. **Trang chủ** – Hero section, feature cards cho khách
2. **Đăng ký** (`/register`) – Form đăng ký
3. **Đăng nhập** (`/login`) – Đăng nhập với tài khoản đã tạo
4. **Trang chính** sau đăng nhập:
   - Form thêm task nhanh
   - Danh sách task với màu sắc theo độ ưu tiên
   - Nút xóa, toggle hoàn thành
5. **Trang Admin** (`/users`) – Quản lý users (đăng nhập bằng tài khoản admin)

---

## 📊 PHẦN 6 – TỔNG KẾT

### Những gì đã làm được

| Yêu cầu | Trạng thái | Ghi chú |
|---------|-----------|---------|
| Mã hóa password bằng bcryptjs | ✅ Hoàn thành | pre-save hook, salt 10 |
| Username không trùng lặp | ✅ Hoàn thành | unique index + kiểm tra thủ công |
| 1 task = 1 user | ✅ Hoàn thành | trường `createdBy` |
| API getAllTasks | ✅ Hoàn thành | GET /api/tasks/all |
| Lấy task theo username | ✅ Hoàn thành | GET /api/tasks/by-username/:username |
| Task trong ngày hôm nay | ✅ Hoàn thành | GET /api/tasks/today |
| Task chưa hoàn thành | ✅ Hoàn thành | GET /api/tasks/incomplete |
| Task của user họ Nguyễn | ✅ Hoàn thành | GET /api/tasks/by-nguyen |
| File test Postman | ✅ Hoàn thành | 17 request có test script |
| Giao diện web (EJS) | ✅ Hoàn thành | Bootstrap 5, responsive |

### Công nghệ chính sử dụng

```
Node.js  ·  Express.js  ·  MongoDB  ·  Mongoose  ·  EJS
bcryptjs  ·  express-session  ·  Bootstrap 5  ·  Postman
```

### Link GitHub

```
https://github.com/truongvany/todo_app
```

---

*Cảm ơn thầy/cô đã xem – Trương Văn Ý*
