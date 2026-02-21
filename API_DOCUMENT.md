# 📄 TÀI LIỆU API – TODO LIST APP (Level 1)

> **Môn học:** JavaScript  
> **Sinh viên:** Trương Văn Ý  
> **Ngày:** 21/02/2026  
> **Base URL:** `http://localhost:3000`  
> **Công nghệ:** Node.js · Express · MongoDB · Mongoose · bcryptjs

---

## MỤC LỤC

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Cấu trúc dữ liệu (Models)](#2-cấu-trúc-dữ-liệu-models)
3. [API Người dùng (Users)](#3-api-người-dùng-users)
4. [API Công việc (Tasks)](#4-api-công-việc-tasks)
5. [Mã HTTP thường gặp](#5-mã-http-thường-gặp)
6. [Hướng dẫn test với Postman](#6-hướng-dẫn-test-với-postman)

---

## 1. Tổng quan kiến trúc

```
Client (Postman / Trình duyệt)
        │
        │  HTTP Request (JSON)
        ▼
┌───────────────────────────────┐
│       Express.js Server       │  cổng 3000
│  ┌─────────────────────────┐  │
│  │   /api/users  (router)  │  │  ← userRoutes.js
│  │   /api/tasks  (router)  │  │  ← taskRoutes.js
│  └─────────────────────────┘  │
└───────────────┬───────────────┘
                │  Mongoose ODM
                ▼
        MongoDB Database
        ┌──────────────┐
        │  users       │  ← Model User.js
        │  tasks       │  ← Model Task.js
        └──────────────┘
```

**Nguyên tắc thiết kế Level 1:**
- ✅ Password được **băm (hash)** bằng `bcryptjs` trước khi lưu vào DB
- ✅ `username` là **duy nhất** — không cho phép trùng lặp  
- ✅ Mỗi task **chỉ thuộc về 1 user** (người tạo) thông qua trường `createdBy`
- ✅ Response JSON nhất quán: luôn có trường `success`, `message`, dữ liệu

---

## 2. Cấu trúc dữ liệu (Models)

### 2.1 User Schema

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `_id` | ObjectId | Auto | ID tự động của MongoDB |
| `username` | String | ✅ | Tên đăng nhập, **duy nhất**, tối thiểu 3 ký tự |
| `password` | String | ✅ | Mật khẩu đã **băm bằng bcryptjs**, tối thiểu 6 ký tự |
| `firstName` | String | ✅ | Họ (ví dụ: Nguyễn, Trần) |
| `lastName` | String | ✅ | Tên (ví dụ: Văn A) |
| `email` | String | ❌ | Email (tùy chọn) |
| `role` | String | ❌ | Quyền: `"normal"` (mặc định) hoặc `"admin"` |
| `createdAt` | Date | Auto | Ngày tạo tài khoản |

> **Bảo mật:** Trường `password` KHÔNG BAO GIỜ được trả về trong response API.  
> Cơ chế: `pre('save')` hook tự động gọi `bcrypt.hash(password, 10)` trước khi lưu.

### 2.2 Task Schema

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `_id` | ObjectId | Auto | ID tự động của MongoDB |
| `title` | String | ✅ | Tiêu đề công việc |
| `description` | String | ❌ | Mô tả chi tiết |
| `createdBy` | ObjectId (ref: User) | ✅ | **User sở hữu task** (Level 1: 1 task = 1 user) |
| `status` | String | ❌ | Trạng thái: `"pending"` · `"in-progress"` · `"completed"` |
| `priority` | String | ❌ | Độ ưu tiên: `"low"` · `"medium"` (mặc định) · `"high"` |
| `dueDate` | Date | ❌ | Ngày đến hạn |
| `createdAt` | Date | Auto | Ngày tạo task |
| `completedAt` | Date | Auto | Ngày hoàn thành |

---

## 3. API Người dùng (Users)

Base path: `/api/users`

---

### 3.1 Đăng ký tài khoản

```
POST /api/users/register
```

**Mô tả:** Tạo tài khoản người dùng mới. Password được tự động **băm (hash)** bằng `bcryptjs` với salt 10 vòng trước khi lưu vào database.

**Request Body (JSON):**

```json
{
  "username":  "nguyenvana",
  "password":  "123456",
  "firstName": "Nguyễn",
  "lastName":  "Văn A",
  "email":     "nguyenvana@gmail.com",
  "role":      "normal"
}
```

| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| `username` | ✅ | Duy nhất, tối thiểu 3 ký tự |
| `password` | ✅ | Tối thiểu 6 ký tự (sẽ được hash) |
| `firstName` | ✅ | Họ của người dùng |
| `lastName` | ✅ | Tên của người dùng |
| `email` | ❌ | Địa chỉ email |
| `role` | ❌ | `"normal"` hoặc `"admin"` (mặc định: `"normal"`) |

**Response thành công (201 Created):**

```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "user": {
    "id":        "65f1a2b3c4d5e6f7a8b9c0d1",
    "username":  "nguyenvana",
    "firstName": "Nguyễn",
    "lastName":  "Văn A",
    "email":     "nguyenvana@gmail.com",
    "role":      "normal"
  }
}
```

> ⚠️ Lưu ý: Trường `password` không xuất hiện trong response.

**Response lỗi – Username đã tồn tại (400 Bad Request):**

```json
{
  "success": false,
  "message": "Username đã tồn tại"
}
```

---

### 3.2 Đăng nhập

```
POST /api/users/login
```

**Mô tả:** Xác thực người dùng. Server dùng `bcrypt.compare()` để so sánh password gốc với chuỗi hash đã lưu trong DB.

**Request Body (JSON):**

```json
{
  "username": "nguyenvana",
  "password": "123456"
}
```

**Response thành công (200 OK):**

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "user": {
    "id":        "65f1a2b3c4d5e6f7a8b9c0d1",
    "username":  "nguyenvana",
    "firstName": "Nguyễn",
    "lastName":  "Văn A",
    "role":      "normal"
  }
}
```

**Response lỗi – Sai thông tin (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Username hoặc password không đúng"
}
```

---

### 3.3 Đăng xuất

```
POST /api/users/logout
```

**Mô tả:** Hủy phiên đăng nhập (session).

**Response thành công (200 OK):**

```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

### 3.4 Lấy tất cả người dùng

```
GET /api/users/all
```

**Mô tả:** Trả về danh sách toàn bộ người dùng. Trường `password` bị loại khỏi kết quả bằng `.select('-password')`.

**Response thành công (200 OK):**

```json
{
  "success": true,
  "count": 3,
  "users": [
    {
      "_id":       "65f1a2b3c4d5e6f7a8b9c0d1",
      "username":  "nguyenvana",
      "firstName": "Nguyễn",
      "lastName":  "Văn A",
      "email":     "nguyenvana@gmail.com",
      "role":      "normal",
      "createdAt": "2026-02-21T08:00:00.000Z"
    }
  ]
}
```

---

### 3.5 Lấy người dùng họ Nguyễn

```
GET /api/users/nguyen
```

**Mô tả:** Lọc ra các người dùng có `firstName` là `"Nguyễn"` (không phân biệt hoa/thường). Dùng regex MongoDB: `{ $regex: /^nguyễn$/i }`.

**Response thành công (200 OK):**

```json
{
  "success": true,
  "count": 2,
  "users": [
    {
      "_id":       "65f1a2b3c4d5e6f7a8b9c0d1",
      "username":  "nguyenvana",
      "firstName": "Nguyễn",
      "lastName":  "Văn A",
      "role":      "normal"
    },
    {
      "_id":       "65f1a2b3c4d5e6f7a8b9c0d2",
      "username":  "nguyenthib",
      "firstName": "Nguyễn",
      "lastName":  "Thị B",
      "role":      "normal"
    }
  ]
}
```

---

### 3.6 Lấy người dùng theo ID

```
GET /api/users/:id
```

**Tham số URL:**

| Tham số | Mô tả |
|---------|-------|
| `id` | ObjectId của user trong MongoDB |

**Ví dụ:** `GET /api/users/65f1a2b3c4d5e6f7a8b9c0d1`

**Response thành công (200 OK):**

```json
{
  "success": true,
  "user": {
    "_id":       "65f1a2b3c4d5e6f7a8b9c0d1",
    "username":  "nguyenvana",
    "firstName": "Nguyễn",
    "lastName":  "Văn A",
    "role":      "normal"
  }
}
```

**Response lỗi – Không tìm thấy (404 Not Found):**

```json
{
  "success": false,
  "message": "Không tìm thấy user"
}
```

---

### 3.7 Cập nhật thông tin người dùng

```
PUT /api/users/:id
```

**Request Body (JSON):**

```json
{
  "firstName": "Nguyễn",
  "lastName":  "Văn B",
  "email":     "moi@gmail.com",
  "role":      "admin"
}
```

**Response thành công (200 OK):**

```json
{
  "success": true,
  "message": "Cập nhật thành công",
  "user": { ... }
}
```

---

### 3.8 Xóa người dùng

```
DELETE /api/users/:id
```

**Response thành công (200 OK):**

```json
{
  "success": true,
  "message": "Xóa user thành công"
}
```

---

## 4. API Công việc (Tasks)

Base path: `/api/tasks`

---

### 4.1 Lấy tất cả công việc (getAllTasks)

```
GET /api/tasks/all
```

**Mô tả:** Trả về toàn bộ danh sách công việc trong hệ thống, có thông tin chi tiết về người tạo (`createdBy`). Sắp xếp theo ngày tạo mới nhất lên đầu.

**Response thành công (200 OK):**

```json
{
  "success": true,
  "count": 3,
  "tasks": [
    {
      "_id":   "65f2b3c4d5e6f7a8b9c0d1e2",
      "title": "Học Node.js",
      "description": "Ôn tập Express, Mongoose",
      "status": "pending",
      "priority": "high",
      "dueDate": "2026-02-28T00:00:00.000Z",
      "createdAt": "2026-02-21T09:00:00.000Z",
      "createdBy": {
        "_id":       "65f1a2b3c4d5e6f7a8b9c0d1",
        "username":  "nguyenvana",
        "firstName": "Nguyễn",
        "lastName":  "Văn A"
      }
    }
  ]
}
```

---

### 4.2 Tạo công việc mới

```
POST /api/tasks/create
```

**Mô tả:** Tạo một công việc mới gắn với 1 user duy nhất (người tạo). Đây là yêu cầu cốt lõi của Level 1: **1 task chỉ thuộc về 1 user**.

**Request Body (JSON):**

```json
{
  "title":       "Học Node.js",
  "description": "Ôn tập Express, Mongoose",
  "userId":      "65f1a2b3c4d5e6f7a8b9c0d1",
  "priority":    "high",
  "dueDate":     "2026-02-28"
}
```

| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| `title` | ✅ | Tiêu đề công việc |
| `userId` | ✅ | ID của user sở hữu task |
| `description` | ❌ | Mô tả chi tiết |
| `priority` | ❌ | `"low"` / `"medium"` / `"high"` (mặc định: `"medium"`) |
| `dueDate` | ❌ | Ngày đến hạn (ISO 8601) |

**Response thành công (201 Created):**

```json
{
  "success": true,
  "message": "Tạo task thành công",
  "task": {
    "_id":       "65f2b3c4d5e6f7a8b9c0d1e2",
    "title":     "Học Node.js",
    "status":    "pending",
    "priority":  "high",
    "dueDate":   "2026-02-28T00:00:00.000Z",
    "createdAt": "2026-02-21T09:00:00.000Z",
    "createdBy": {
      "_id":       "65f1a2b3c4d5e6f7a8b9c0d1",
      "username":  "nguyenvana",
      "firstName": "Nguyễn",
      "lastName":  "Văn A"
    }
  }
}
```

**Response lỗi – User không tồn tại (404 Not Found):**

```json
{
  "success": false,
  "message": "Không tìm thấy user"
}
```

---

### 4.3 Lấy công việc theo username

```
GET /api/tasks/by-username/:username
```

**Mô tả:** Lấy tất cả công việc do một user cụ thể **tạo** (tìm theo `createdBy`). Trước tiên tra cứu user theo `username`, sau đó lọc task theo `_id` của user đó.

**Tham số URL:**

| Tham số | Mô tả |
|---------|-------|
| `username` | Tên đăng nhập của user |

**Ví dụ:** `GET /api/tasks/by-username/nguyenvana`

**Response thành công (200 OK):**

```json
{
  "success":  true,
  "count":    2,
  "username": "nguyenvana",
  "tasks": [
    {
      "_id":     "65f2b3c4d5e6f7a8b9c0d1e2",
      "title":   "Học Node.js",
      "status":  "pending",
      "priority": "high",
      "createdBy": {
        "username":  "nguyenvana",
        "firstName": "Nguyễn",
        "lastName":  "Văn A"
      }
    }
  ]
}
```

**Response lỗi – User không tồn tại (404 Not Found):**

```json
{
  "success": false,
  "message": "Không tìm thấy user"
}
```

---

### 4.4 Lấy công việc trong ngày hôm nay

```
GET /api/tasks/today
```

**Mô tả:** Lấy tất cả công việc được **tạo trong ngày hôm nay** (tính theo `createdAt`).

**Cách hoạt động:**
```
today    = ngày hiện tại lúc 00:00:00
tomorrow = today + 1 ngày
→ Tìm: createdAt >= today AND createdAt < tomorrow
```

**Response thành công (200 OK):**

```json
{
  "success": true,
  "count":   2,
  "date":    "21/02/2026",
  "tasks": [
    {
      "_id":      "65f2b3c4d5e6f7a8b9c0d1e2",
      "title":    "Học Node.js",
      "status":   "pending",
      "createdAt": "2026-02-21T09:00:00.000Z",
      "createdBy": {
        "username":  "nguyenvana",
        "firstName": "Nguyễn",
        "lastName":  "Văn A"
      }
    }
  ]
}
```

---

### 4.5 Lấy công việc chưa hoàn thành

```
GET /api/tasks/incomplete
```

**Mô tả:** Lấy tất cả công việc có `status` **khác** `"completed"`. Bao gồm các trạng thái: `"pending"` và `"in-progress"`.

**Truy vấn MongoDB:**
```js
Task.find({ status: { $ne: 'completed' } })
```

**Response thành công (200 OK):**

```json
{
  "success": true,
  "count":   5,
  "tasks": [
    {
      "_id":     "65f2b3c4d5e6f7a8b9c0d1e2",
      "title":   "Học Node.js",
      "status":  "pending",
      "priority": "high",
      "createdBy": {
        "username":  "nguyenvana",
        "firstName": "Nguyễn",
        "lastName":  "Văn A"
      }
    },
    {
      "_id":     "65f2b3c4d5e6f7a8b9c0d1e3",
      "title":   "Làm bài tập",
      "status":  "in-progress",
      "priority": "medium",
      "createdBy": {
        "username":  "tranvanc",
        "firstName": "Trần",
        "lastName":  "Văn C"
      }
    }
  ]
}
```

---

### 4.6 Lấy công việc của user họ Nguyễn

```
GET /api/tasks/by-nguyen
```

**Mô tả:** Lấy tất cả công việc do các user có **họ là "Nguyễn"** tạo ra. Tìm kiếm không phân biệt hoa/thường.

**Các bước xử lý:**

```
Bước 1: Tìm users có firstName khớp regex /^nguyễn$/i
         → [nguyenvana, nguyenthib]

Bước 2: Lấy danh sách _id của những users đó
         → [ObjectId("...d1"), ObjectId("...d2")]

Bước 3: Tìm tasks có createdBy nằm trong danh sách _id đó
         → Task.find({ createdBy: { $in: nguyenUserIds } })
```

**Response thành công (200 OK):**

```json
{
  "success": true,
  "count":   3,
  "nguyenUsers": [
    { "username": "nguyenvana", "fullName": "Nguyễn Văn A" },
    { "username": "nguyenthib", "fullName": "Nguyễn Thị B" }
  ],
  "tasks": [
    {
      "_id":   "65f2b3c4d5e6f7a8b9c0d1e2",
      "title": "Học Node.js",
      "createdBy": {
        "username":  "nguyenvana",
        "firstName": "Nguyễn",
        "lastName":  "Văn A"
      }
    },
    {
      "_id":   "65f2b3c4d5e6f7a8b9c0d1e4",
      "title": "Nộp báo cáo cuối kỳ",
      "createdBy": {
        "username":  "nguyenthib",
        "firstName": "Nguyễn",
        "lastName":  "Thị B"
      }
    }
  ]
}
```

**Response khi không có user họ Nguyễn (200 OK):**

```json
{
  "success": true,
  "count":   0,
  "message": "Không có user nào có họ Nguyễn",
  "tasks":   []
}
```

---

### 4.7 Lấy công việc theo ID

```
GET /api/tasks/:id
```

**Tham số URL:**

| Tham số | Mô tả |
|---------|-------|
| `id` | ObjectId của task trong MongoDB |

**Ví dụ:** `GET /api/tasks/65f2b3c4d5e6f7a8b9c0d1e2`

**Response thành công (200 OK):**

```json
{
  "success": true,
  "task": {
    "_id":        "65f2b3c4d5e6f7a8b9c0d1e2",
    "title":      "Học Node.js",
    "description":"Ôn tập Express, Mongoose",
    "status":     "pending",
    "priority":   "high",
    "dueDate":    "2026-02-28T00:00:00.000Z",
    "createdAt":  "2026-02-21T09:00:00.000Z",
    "createdBy": {
      "_id":       "65f1a2b3c4d5e6f7a8b9c0d1",
      "username":  "nguyenvana",
      "firstName": "Nguyễn",
      "lastName":  "Văn A"
    }
  }
}
```

---

## 5. Mã HTTP thường gặp

| Mã | Tên | Ý nghĩa |
|----|-----|---------|
| `200` | OK | Yêu cầu thành công, có dữ liệu trả về |
| `201` | Created | Tạo mới thành công (register, create task) |
| `400` | Bad Request | Dữ liệu không hợp lệ (username trùng, thiếu trường bắt buộc) |
| `401` | Unauthorized | Sai thông tin đăng nhập |
| `404` | Not Found | Không tìm thấy user / task theo ID |
| `500` | Internal Server Error | Lỗi phía server (DB connection, query lỗi) |

---

## 6. Hướng dẫn test với Postman

### Bước 1: Khởi động server

```bash
cd backend
npm install
npm start
# Server: http://localhost:3000
```

### Bước 2: Import collection

1. Mở Postman → Click **Import**
2. Chọn file `TodoList_Level1.postman_collection.json`
3. Collection **"Todo List - Level 1 API"** xuất hiện trong sidebar

### Bước 3: Chạy theo thứ tự

| # | Request | Mục đích | Ghi chú |
|---|---------|----------|---------|
| 1 | POST `/register` (nguyenvana) | Tạo user + lưu `userId` vào biến | Tự động lưu biến `userId` |
| 2 | POST `/register` (nguyenthib) | Tạo user họ Nguyễn thứ 2 | Copy `_id` từ response |
| 3 | POST `/register` (tranvanc) | Tạo user họ Trần để đối chiếu | Copy `_id` từ response |
| 4 | POST `/register` (trùng username) | Kiểm tra lỗi 400 | Phải nhận `400` |
| 5 | POST `/login` | Kiểm tra bcrypt verify | Lưu lại `userId` |
| 6 | POST `/login` (sai pass) | Kiểm tra lỗi 401 | Phải nhận `401` |
| 7 | GET `/users/all` | Xem password không bị lộ | Không có trường `password` |
| 8 | POST `/tasks/create` | Tạo task cho nguyenvana | `userId` = biến collection |
| 9 | POST `/tasks/create` | Tạo task cho nguyenthib | Paste `_id` nguyenthib vào |
| 10 | POST `/tasks/create` | Tạo task cho tranvanc | Paste `_id` tranvanc vào |
| 11 | GET `/tasks/all` | getAllTasks | Thấy tất cả 3 tasks |
| 12 | GET `/tasks/by-username/nguyenvana` | Task theo username | Chỉ thấy task của nguyenvana |
| 13 | GET `/tasks/by-username/xxx` | Username không tồn tại | Phải nhận `404` |
| 14 | GET `/tasks/today` | Tasks hôm nay | Thấy tasks mới tạo |
| 15 | GET `/tasks/incomplete` | Tasks chưa xong | Status != completed |
| 16 | GET `/tasks/by-nguyen` | Tasks của user họ Nguyễn | Chỉ thấy task của nguyenvana, nguyenthib |
| 17 | GET `/tasks/:id` | Chi tiết 1 task | `taskId` tự lưu từ bước 8 |

### Biến Collection tự động

Postman collection có 2 biến được tự động cập nhật bởi test script:

| Biến | Được lưu khi | Dùng ở |
|------|-------------|--------|
| `{{userId}}` | Register (#1) hoặc Login (#5) thành công | Body của Create Task (#8) |
| `{{taskId}}` | Create Task (#8) thành công | Get Task by ID (#17) |

---

## 7. Cơ chế bảo mật mật khẩu

### Quy trình băm (Hash) khi đăng ký

```
Password gốc: "123456"
         │
         ▼  bcrypt.genSalt(10)  →  tạo salt ngẫu nhiên
         ▼  bcrypt.hash("123456", salt)
         │
Password hash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVujxcVXJq"
         │
         ▼  Lưu vào MongoDB (trường password)
```

### Quy trình xác thực khi đăng nhập

```
Password nhập: "123456"
Hash trong DB: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVujxcVXJq"
         │
         ▼  bcrypt.compare("123456", hash)
         │
         ├─ TRUE  → Đăng nhập thành công (200)
         └─ FALSE → Sai mật khẩu (401)
```

> bcrypt dùng thuật toán **Blowfish** với cost factor 10, nghĩa là thực hiện 2^10 = 1024 vòng lặp, làm chậm brute-force attack.

---

*Tài liệu được tạo ngày 21/02/2026 – Todo List App Level 1*
