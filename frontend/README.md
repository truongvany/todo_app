# 🎨 Todo List Frontend

Frontend cho ứng dụng Todo List.

## 📁 Cấu trúc

```
frontend/
├── views/                 # EJS Templates
│   ├── index.ejs          # Trang chủ
│   ├── login.ejs          # Đăng nhập
│   ├── register.ejs       # Đăng ký
│   ├── users.ejs          # Quản lý users (admin)
│   ├── error.ejs          # Trang lỗi
│   └── partials/
│       ├── header.ejs     # Header
│       └── footer.ejs     # Footer
│
├── public/
│   ├── css/
│   │   └── style.css      # Custom styles
│   └── js/                # JavaScript files
│
└── api-test.html          # Trang test API
```

## 🧪 Test API

Mở file `api-test.html` trong trình duyệt để test các API endpoints:

```bash
# Từ thư mục frontend
start api-test.html
# hoặc
explorer api-test.html
```

## 🎨 Technology Stack

- **EJS** - Template engine
- **Bootstrap 5** - CSS framework
- **Bootstrap Icons** - Icon library
- **Vanilla JavaScript** - Client-side scripting

## 📝 Tính năng

### Level 1: CRUD cơ bản
- ✅ Tạo, xem, xóa tasks
- ✅ Quản lý users
- ✅ Authentication với bcrypt

### Level 2: Giao diện EJS
- ✅ Giao diện responsive với Bootstrap
- ✅ Progress bar hiển thị tiến độ
- ✅ Flash messages
- ✅ Form validation

### Level 3: Phân quyền
- ✅ Role-based access (Admin/Normal)
- ✅ Admin gán task cho users
- ✅ Multi-user task completion
- ✅ Task chỉ hoàn thành khi tất cả assignees complete

## 🎯 User Roles

### Admin
- Xem tất cả tasks
- Tạo tasks
- Gán tasks cho users khác
- Xóa assignees khỏi tasks
- Quản lý users (thêm, sửa, xóa, đổi role)

### Normal User
- Xem tasks được gán
- Tạo tasks của riêng mình
- Đánh dấu hoàn thành tasks của mình
- Xóa tasks tự tạo

## 🖼️ Screenshots

### Trang chủ
- Danh sách tasks với progress bar
- Form thêm task mới
- Thống kê task

### Quản lý Users (Admin)
- Danh sách tất cả users
- Thay đổi role
- Xóa users

## 🚀 Chạy Full-Stack

Để chạy cả frontend và backend:

```bash
# Từ thư mục root
npm start
# hoặc
npm run fullstack
```

Truy cập: http://localhost:3000
