# 📝 Todo List Application

Ứng dụng Todo List đơn giản được xây dựng với Node.js, Express, MongoDB và EJS.

## ⚡ Quick Start

```bash
# 1. Cài đặt dependencies
npm install

# 2. Tạo dữ liệu mẫu
npm run seed

# 3. Chạy ứng dụng
npm start
```

Truy cập: **http://localhost:3000**

Login: `admin/admin123` hoặc `nguyenvana/123456`

## 📖 Tài liệu

- **[📚 Hướng dẫn Sử dụng Chi tiết](HUONG_DAN_SU_DUNG.md)** - Hướng dẫn đầy đủ
- **[🔧 Backend API Documentation](backend/README.md)** - API endpoints
- **[🎨 Frontend Documentation](frontend/README.md)** - Giao diện web
- **[🧪 API Testing](frontend/api-test.html)** - Test API page

## 📋 Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Cấu trúc Project](#cấu-trúc-project)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Giao diện Web](#giao-diện-web)
- [Chức năng](#chức-năng)

---

## 🔧 Yêu cầu hệ thống

- Node.js (v14 trở lên)
- MongoDB (v4.4 trở lên)
- npm hoặc yarn

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd TODO_LIST
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` với nội dung:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/todo_db
SESSION_SECRET=your_secret_key_here
```

### 4. Khởi tạo dữ liệu mẫu (tùy chọn)

```bash
npm run seed
```

### 5. Chạy ứng dụng

#### Chạy Full-Stack (Frontend + Backend)
```bash
npm start
# hoặc
npm run fullstack
```

#### Chạy Backend API riêng
```bash
npm run backend
# hoặc
cd backend && npm start
```

#### Test API
Mở file `frontend/api-test.html` trong browser để test API endpoints.

Truy cập:
- Full-stack: http://localhost:3000
- API Testing: `frontend/api-test.html`

### 📋 Thông tin đăng nhập mẫu

| Role   | Username    | Password  |
|--------|-------------|-----------|
| Admin  | admin       | admin123  |
| Normal | nguyenvana  | 123456    |
| Normal | tranthib    | 123456    |
| Normal | nguyenvanc  | 123456    |
| Normal | levand      | 123456    |

---

## 📁 Cấu trúc Project

```
TODO_LIST/
├── server.js              # Entry point - khởi động server
├── package.json
├── seed.js                # Script tạo dữ liệu mẫu
├── .env                   # Biến môi trường
├── .gitignore
│
├── backend/               # ===== BACKEND =====
│   ├── app.js             # Express app configuration
│   │
│   ├── config/
│   │   └── database.js    # MongoDB connection
│   │
│   ├── models/
│   │   ├── User.js        # Model User
│   │   └── Task.js        # Model Task
│   │
│   ├── routes/
│   │   ├── userRoutes.js  # API routes cho User
│   │   ├── taskRoutes.js  # API routes cho Task
│   │   └── viewRoutes.js  # Routes cho giao diện web
│   │
│   └── middleware/
│       └── auth.js        # Middleware xác thực
│
└── frontend/              # ===== FRONTEND =====
    ├── views/
    │   ├── index.ejs      # Trang chủ
    │   ├── login.ejs      # Trang đăng nhập
    │   ├── register.ejs   # Trang đăng ký
    │   ├── users.ejs      # Quản lý users (admin)
    │   ├── error.ejs      # Trang lỗi
    │   └── partials/
    │       ├── header.ejs # Header template
    │       └── footer.ejs # Footer template
    │
    └── public/
        ├── css/
        │   └── style.css  # Custom styles
        └── js/            # JavaScript files
```

---

## 💾 Database Schema

### Collection: Users

```javascript
{
    username: String,       // Unique, required
    password: String,       // Hashed với bcrypt
    firstName: String,      // Họ
    lastName: String,       // Tên
    email: String,
    role: String,           // 'admin' | 'normal'
    createdAt: Date
}
```

### Collection: Tasks

```javascript
{
    title: String,          // Required
    description: String,
    createdBy: ObjectId,    // Ref -> User
    assignees: [{
        user: ObjectId,     // Ref -> User
        isCompleted: Boolean,
        completedAt: Date
    }],
    status: String,         // 'pending' | 'in-progress' | 'completed'
    completedAt: Date,      // Thời gian hoàn thành
    createdAt: Date,
    dueDate: Date,
    priority: String        // 'low' | 'medium' | 'high'
}
```

---

## 📡 API Documentation

### Base URL: `/api`

### 👤 User APIs (`/api/users`)

| Method | Endpoint         | Mô tả                           |
|--------|------------------|---------------------------------|
| POST   | `/register`      | Đăng ký user mới               |
| POST   | `/login`         | Đăng nhập                       |
| POST   | `/logout`        | Đăng xuất                       |
| GET    | `/all`           | Lấy tất cả users               |
| GET    | `/nguyen`        | Lấy users có họ "Nguyễn"       |
| GET    | `/:id`           | Lấy user theo ID               |
| PUT    | `/:id`           | Cập nhật user                  |
| DELETE | `/:id`           | Xóa user                       |

### 📝 Task APIs (`/api/tasks`)

| Method | Endpoint                    | Mô tả                                    |
|--------|-----------------------------|------------------------------------------|
| GET    | `/all`                      | **Lấy tất cả tasks (getAllTasks)**       |
| GET    | `/by-username/:username`    | **Lấy task theo tên user**               |
| GET    | `/today`                    | **Xuất các task trong ngày hiện tại**    |
| GET    | `/incomplete`               | **Xuất các task chưa hoàn thành**        |
| GET    | `/by-nguyen`                | **Xuất task của users họ "Nguyễn"**      |
| POST   | `/create`                   | Tạo task mới                             |
| GET    | `/:id`                      | Lấy task theo ID                         |
| PUT    | `/:id`                      | Cập nhật task                            |
| DELETE | `/:id`                      | Xóa task                                 |
| POST   | `/:id/assign`               | **Phân công task (Level 3, admin only)** |
| POST   | `/:id/complete`             | Đánh dấu hoàn thành                      |
| POST   | `/:id/uncomplete`           | Hủy hoàn thành                           |
| DELETE | `/:id/assignee/:assigneeId` | Xóa assignee khỏi task                   |

---

## 🖼️ Giao diện Web

### Level 2 - Giao diện cơ bản

- **Trang chủ**: Hiển thị danh sách tasks với input thêm mới
- **Form thêm task**: Input tiêu đề, mô tả, ngày đến hạn, độ ưu tiên
- **Danh sách tasks**: Hiển thị dạng list với nút hoàn thành/xóa
- **Progress bar**: Hiển thị % hoàn thành tổng thể

### Level 3 - Phân quyền

- **Admin features**:
  - Quản lý users (nâng/hạ role, xóa)
  - Phân công task cho user khác
  - Xem và quản lý tất cả tasks
  
- **Task có nhiều người thực hiện**:
  - Progress bar theo số người hoàn thành
  - Task chỉ hoàn thành khi TẤT CẢ đánh dấu done

---

## ✨ Chức năng chi tiết

### Level 1: API

✅ Password được hash bằng bcrypt (10 rounds)  
✅ Username unique - không trùng lặp  
✅ 1 User có nhiều tasks, 1 task thuộc 1 user tạo  
✅ API getAllTasks - lấy tất cả tasks  
✅ API getTasksByUsername - lấy task theo username  
✅ API getTasksToday - lấy task trong ngày  
✅ API getIncompleteTasks - lấy task chưa hoàn thành  
✅ API getTasksByNguyen - lấy task của users họ Nguyễn  

### Level 2: Giao diện EJS

✅ Input nhập công việc  
✅ Button thêm công việc  
✅ Danh sách (ul) hiển thị công việc  
✅ Nút "Xóa" cho mỗi task  
✅ Progress bar (Bootstrap) hiển thị tiến độ  

### Level 3: Phân quyền

✅ 2 Role: admin và normal  
✅ Admin phân công task cho user khác  
✅ 1 Task có thể có nhiều người thực hiện  
✅ Task hoàn thành khi TẤT CẢ người được gán đánh dấu xong  

---

## 📸 Screenshots

*(Thêm screenshots của ứng dụng ở đây)*

---

## 🔄 Luồng hoạt động

### 1. Đăng ký/Đăng nhập

```
User → Nhập thông tin → Validate → Hash password → Lưu DB → Session
```

### 2. Tạo Task

```
User đăng nhập → Nhập task → API /tasks (POST) → Lưu DB → Refresh trang
```

### 3. Hoàn thành Task

```
User click "Hoàn thành" → API toggle → Cập nhật assignee → Check all done → Update status
```

### 4. Phân công Task (Admin)

```
Admin → Chọn task → Modal phân công → Chọn user → API assign → Thêm assignee
```

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **View Engine**: EJS
- **Authentication**: bcryptjs, express-session
- **Frontend**: Bootstrap 5, Bootstrap Icons
- **Other**: method-override, connect-flash

---

## 📞 Liên hệ

- **Môn học**: JavaScript
- **Bài tập**: Todo List đơn giản
- **Hạn nộp**: 22/02/2026

---

© 2026 Todo List Application
