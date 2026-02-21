# 🔧 Todo List Backend API

Backend API server cho ứng dụng Todo List.

## 🚀 Chạy Backend

### Cách 1: Chạy từ thư mục root
```bash
npm run backend
```

### Cách 2: Chạy từ thư mục backend
```bash
cd backend
npm start
```

Server sẽ chạy tại: http://localhost:3000

## 📡 API Endpoints

### User APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Đăng ký user mới |
| POST | `/api/users/login` | Đăng nhập |
| POST | `/api/users/logout` | Đăng xuất |
| GET | `/api/users/all` | Lấy tất cả users |
| GET | `/api/users/nguyen` | Lấy users có họ 'Nguyễn' |
| GET | `/api/users/:id` | Lấy user theo ID |
| PUT | `/api/users/:id` | Cập nhật user |
| DELETE | `/api/users/:id` | Xóa user |

### Task APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/all` | Lấy tất cả tasks |
| GET | `/api/tasks/today` | Tasks trong ngày hiện tại |
| GET | `/api/tasks/incomplete` | Tasks chưa hoàn thành |
| GET | `/api/tasks/by-nguyen` | Tasks của users họ 'Nguyễn' |
| GET | `/api/tasks/by-username/:username` | Tasks theo username |
| GET | `/api/tasks/:id` | Lấy task theo ID |
| POST | `/api/tasks/create` | Tạo task mới |
| PUT | `/api/tasks/:id` | Cập nhật task |
| DELETE | `/api/tasks/:id` | Xóa task |
| POST | `/api/tasks/:id/assign` | Gán task cho user (admin) |
| POST | `/api/tasks/:id/complete` | Đánh dấu hoàn thành |
| POST | `/api/tasks/:id/uncomplete` | Hủy hoàn thành |
| DELETE | `/api/tasks/:id/assignee/:assigneeId` | Xóa assignee |

## 📝 Ví dụ Request

### Đăng ký user
```bash
POST /api/users/register
Content-Type: application/json

{
  "username": "nguyenvana",
  "password": "123456",
  "firstName": "Nguyễn",
  "lastName": "Văn A",
  "email": "nguyenvana@example.com"
}
```

### Tạo task
```bash
POST /api/tasks/create
Content-Type: application/json

{
  "title": "Hoàn thành bài tập",
  "description": "Làm bài tập JavaScript",
  "userId": "user_id_here",
  "priority": "high",
  "dueDate": "2026-02-22"
}
```

## 🧪 Testing API

Mở file `frontend/api-test.html` trong browser để test các API endpoints.

## 🗂️ Cấu trúc Backend

```
backend/
├── server.js              # Entry point
├── app.js                 # Express configuration
├── package.json
│
├── config/
│   └── database.js        # MongoDB connection
│
├── models/
│   ├── User.js            # User schema
│   └── Task.js            # Task schema
│
├── routes/
│   ├── userRoutes.js      # User API routes
│   ├── taskRoutes.js      # Task API routes
│   └── viewRoutes.js      # View routes (EJS)
│
└── middleware/
    └── auth.js            # Authentication middleware
```

## 🔐 Authentication

Ứng dụng sử dụng express-session để quản lý authentication.

- Password được hash bằng bcryptjs
- Session được lưu trong memory (có thể chuyển sang Redis cho production)

## 🛠️ Technologies

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcryptjs** - Password hashing
- **express-session** - Session management
