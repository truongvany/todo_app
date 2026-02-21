# 📖 Hướng dẫn Sử dụng Todo List Application

## 🎯 Tổng quan

Ứng dụng Todo List được tổ chức thành 2 phần:
- **Backend**: API Server (Node.js + Express + MongoDB)
- **Frontend**: Giao diện web (EJS Templates + Bootstrap)

## 🚀 Cách chạy ứng dụng

### Option 1: Chạy Full-Stack (Khuyến nghị)

```bash
npm start
# hoặc
npm run fullstack
```

- Truy cập: http://localhost:3000
- Bao gồm cả API và giao diện web
- Đăng nhập bằng tài khoản admin hoặc user thường

### Option 2: Chỉ chạy Backend API

```bash
npm run backend
```

- Server API chạy tại: http://localhost:3000
- Chỉ trả về JSON responses
- Test API qua `frontend/api-test.html`

## 📋 Các Script Commands

```bash
npm install          # Cài đặt dependencies
npm run seed         # Tạo dữ liệu mẫu
npm start            # Chạy full-stack
npm run backend      # Chạy riêng backend API
npm run fullstack    # Chạy full-stack (giống npm start)
```

## 🔐 Tài khoản Test

Sau khi chạy `npm run seed`, bạn có các tài khoản:

### Admin Account
```
Username: admin
Password: admin123
```

**Quyền hạn:**
- ✅ Xem tất cả tasks
- ✅ Tạo và xóa tasks
- ✅ Gán tasks cho users khác
- ✅ Quản lý users (thêm, sửa, xóa, đổi role)
- ✅ Xóa assignees khỏi tasks

### User Accounts
```
Username: nguyenvana, tranthib, nguyenvanc, levand
Password: 123456
```

**Quyền hạn:**
- ✅ Xem tasks được gán
- ✅ Tạo tasks của riêng mình
- ✅ Đánh dấu hoàn thành/chưa hoàn thành tasks
- ✅ Xóa tasks tự tạo

## 🎓 Hướng dẫn Sử dụng Giao diện

### 1. Đăng nhập
1. Truy cập http://localhost:3000
2. Click "Đăng nhập"
3. Nhập username và password
4. Click "Đăng nhập"

### 2. Đăng ký tài khoản mới
1. Truy cập http://localhost:3000/register
2. Điền thông tin:
   - Họ và Tên
   - Username (3+ ký tự, không trùng)
   - Email (tùy chọn)
   - Password (6+ ký tự)
3. Click "Đăng ký"

### 3. Tạo Task mới
1. Đăng nhập vào hệ thống
2. Ở sidebar bên trái, điền form "Thêm công việc mới":
   - **Tiêu đề**: Tên task (bắt buộc)
   - **Mô tả**: Chi tiết task (tùy chọn)
   - **Ngày đến hạn**: Deadline (tùy chọn)
   - **Độ ưu tiên**: Thấp/Trung bình/Cao
3. Click "Thêm công việc"

### 4. Đánh dấu Hoàn thành Task
1. Tìm task trong danh sách
2. Click nút ⭕ (circle) bên trái task
3. Nút sẽ chuyển thành ✅ (check) và màu xanh
4. Task title sẽ có gạch ngang

**Lưu ý:** Với task có nhiều người:
- Mỗi người click hoàn thành riêng
- Progress bar hiển thị % hoàn thành
- Task chỉ hoàn toàn xong khi TẤT CẢ người đều đánh dấu hoàn thành

### 5. Xóa Task
1. Tìm task cần xóa
2. Click nút 🗑️ (trash) bên phải task
3. Xác nhận xóa

**Quyền hạn:**
- User thường: Chỉ xóa được task tự tạo
- Admin: Xóa được mọi task

### 6. Phân công Task (Admin)
1. Đăng nhập với tài khoản admin
2. Tìm task cần phân công
3. Click nút 👤+ (person plus)
4. Chọn user cần gán từ dropdown
5. Click "Phân công"

### 7. Quản lý Users (Admin)
1. Đăng nhập admin
2. Click "Quản lý Users" trên navbar
3. Xem danh sách tất cả users

**Hành động:**
- **⬆️ Nâng cấp lên Admin**: Click nút mũi tên lên
- **⬇️ Hạ xuống Normal**: Click nút mũi tên xuống
- **🗑️ Xóa user**: Click nút trash (không thể xóa chính mình)

## 🧪 Testing API

### Sử dụng API Test Page

1. Chạy backend: `npm run backend`
2. Mở file `frontend/api-test.html` trong browser
3. Click các nút "Test" để gọi API
4. Xem response bên dưới mỗi endpoint

### Sử dụng cURL

```bash
# Lấy tất cả tasks
curl http://localhost:3000/api/tasks/all

# Lấy tasks hôm nay
curl http://localhost:3000/api/tasks/today

# Lấy tasks chưa hoàn thành
curl http://localhost:3000/api/tasks/incomplete

# Lấy tasks của user họ Nguyễn
curl http://localhost:3000/api/tasks/by-nguyen

# Đăng ký user mới
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com"
  }'

# Đăng nhập
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Sử dụng Postman

1. Import collection từ file `postman_collection.json` (nếu có)
2. Hoặc tạo requests thủ công theo API documentation
3. Base URL: `http://localhost:3000`

## 📊 Hiểu về Tasks và Progress

### Trạng thái Task
- **Pending** (Chờ): Mới tạo, chưa ai làm
- **In Progress** (Đang làm): Ít nhất 1 người đã bắt đầu
- **Completed** (Hoàn thành): TẤT CẢ người đã hoàn thành

### Progress Bar
- Hiển thị % người đã hoàn thành
- Màu xanh khi 100%
- Màu xanh dương khi chưa xong

### Badge màu
- **Đỏ** (High): Độ ưu tiên cao
- **Vàng** (Medium): Độ ưu tiên trung bình
- **Xám** (Low): Độ ưu tiên thấp

## 🎨 Giao diện Features

### Dashboard (Trang chủ)
- ✅ Form tạo task mới (sidebar trái)
- ✅ Thống kê tasks (tổng, hoàn thành, chưa xong, %)
- ✅ Danh sách tasks với filters
- ✅ Progress bar cho từng task
- ✅ Badge hiển thị priority và status

### Task Card Components
- ✅ Checkbox hoàn thành
- ✅ Tiêu đề và mô tả
- ✅ Priority badge (màu)
- ✅ Status badge
- ✅ Progress bar (task nhiều người)
- ✅ Danh sách assignees với status
- ✅ Ngày tạo, deadline, ngày hoàn thành
- ✅ Nút phân công (admin)
- ✅ Nút xóa

### Animations & Effects
- ✅ Flash messages tự động ẩn sau 5 giây
- ✅ Hover effect trên task cards
- ✅ Smooth transitions
- ✅ Responsive design

## ❓ Troubleshooting

### Lỗi: Cannot connect to MongoDB
```bash
# Kiểm tra MongoDB đang chạy
# Windows:
net start MongoDB

# Kiểm tra .env file
MONGODB_URI=mongodb://localhost:27017/todo_db
```

### Lỗi: Port 3000 đã được sử dụng
```bash
# Đổi port trong .env
PORT=3001

# Hoặc kill process đang dùng port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Lỗi: Module not found
```bash
# Cài lại dependencies
npm install
```

### Reset dữ liệu
```bash
# Chạy lại seed để reset về mẫu
npm run seed
```

## 📚 Tài liệu thêm

- [Backend README](backend/README.md) - Chi tiết về API
- [Frontend README](frontend/README.md) - Chi tiết về giao diện
- [.env.example](.env) - Ví dụ cấu hình môi trường

## 🎯 Level Requirements

### ✅ Level 1: Backend APIs
- ✅ CRUD operations cho users và tasks
- ✅ Password hashing với bcryptjs
- ✅ Username unique constraint
- ✅ getAllTasks API
- ✅ getTasksByUsername API
- ✅ getTasksToday API
- ✅ getIncompleteTasks API
- ✅ getTasksByNguyen API

### ✅ Level 2: Frontend với EJS
- ✅ Giao diện responsive Bootstrap
- ✅ Form thêm task
- ✅ Danh sách tasks với nút xóa
- ✅ Progress bar hiển thị tiến độ
- ✅ Flash messages
- ✅ Authentication pages

### ✅ Level 3: Phân quyền
- ✅ Role system (Admin/Normal)
- ✅ Admin gán task cho users
- ✅ Multi-user tasks
- ✅ Task chỉ hoàn thành khi tất cả users complete
- ✅ CRUD users (admin only)
- ✅ Change user roles

## 🎓 Demo Workflow

### Workflow 1: User thường tạo task
1. Login bằng `nguyenvana/123456`
2. Tạo task "Học MongoDB"
3. Đánh dấu hoàn thành
4. Task chuyển sang completed

### Workflow 2: Admin phân công task
1. Login bằng `admin/admin123`
2. Tạo task "Review code"
3. Click nút phân công
4. Chọn `tranthib` và `nguyenvanc`
5. Logout, login bằng `tranthib/123456`
6. Thấy task "Review code", đánh dấu hoàn thành
7. Task vẫn "In Progress" (50%)
8. Login bằng `nguyenvanc/123456`
9. Đánh dấu hoàn thành
10. Task chuyển sang "Completed" (100%)

### Workflow 3: Admin quản lý users
1. Login bằng `admin/admin123`
2. Click "Quản lý Users"
3. Nâng `nguyenvana` lên Admin
4. Logout, login lại bằng `nguyenvana/123456`
5. Thấy menu "Quản lý Users" xuất hiện

## 📝 Notes

- Session timeout: 24 giờ
- Password minimum length: 6 ký tự
- Username minimum length: 3 ký tự
- Username không được trùng
- Task phải có ít nhất 1 assignee
