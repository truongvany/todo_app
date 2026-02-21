# 📦 Tổng kết Bài tập Todo List

**Sinh viên:** [Tên của bạn]  
**Lớp:** [Lớp của bạn]  
**Môn:** JavaScript  
**Hạn nộp:** 22/02/2026

---

## ✅ Hoàn thành

### Level 1: Backend APIs ✅
- ✅ Collection `users` và `tasks` trên MongoDB
- ✅ Quản lý trạng thái done/chưa done và thời gian done
- ✅ Mã hóa password bằng bcryptjs
- ✅ Username unique constraint
- ✅ 1 user có nhiều tasks, 1 task thuộc về 1 user (người tạo)
- ✅ API: `getAllTasks` - Lấy tất cả tasks
- ✅ API: `getTasksByUsername` - Lấy task theo tên user
- ✅ API: `getTasksToday` - Xuất tasks trong ngày hiện tại
- ✅ API: `getIncompleteTasks` - Xuất tasks chưa hoàn thành
- ✅ API: `getTasksByNguyen` - Xuất tasks với users có họ 'Nguyễn'

### Level 2: Giao diện EJS ✅
- ✅ Trang web với EJS templates
- ✅ Form input thêm công việc
- ✅ Danh sách (ul/li) hiển thị các công việc
- ✅ Nút "Xóa" cho mỗi công việc
- ✅ Progress bar Bootstrap hiển thị tiến độ hoàn thành
- ✅ Giao diện responsive với Bootstrap 5
- ✅ Flash messages
- ✅ Animations và transitions

### Level 3: Phân quyền ✅
- ✅ Role system: Admin và Normal
- ✅ Admin phân quyền task cho user khác
- ✅ 1 task có thể có nhiều người cùng làm
- ✅ Task chỉ hoàn thành khi TẤT CẢ người được gán đều complete
- ✅ Quản lý users (admin only)
- ✅ Change user roles

---

## 📁 Cấu trúc Project

```
TODO_LIST/
├── README.md                    # Tài liệu chính
├── HUONG_DAN_SU_DUNG.md        # Hướng dẫn chi tiết
├── package.json
├── server.js                    # Entry point
├── seed.js                      # Tạo dữ liệu mẫu
├── .env                         # Config (không commit)
├── .env.example                 # Example config
│
├── backend/                     # ===== BACKEND =====
│   ├── README.md                # API Documentation
│   ├── server.js                # Backend entry point
│   ├── app.js                   # Express config
│   ├── package.json
│   │
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   │
│   ├── models/
│   │   ├── User.js              # User schema với bcrypt
│   │   └── Task.js              # Task schema
│   │
│   ├── routes/
│   │   ├── userRoutes.js        # User APIs
│   │   ├── taskRoutes.js        # Task APIs
│   │   └── viewRoutes.js        # View routes
│   │
│   └── middleware/
│       └── auth.js              # Authentication
│
└── frontend/                    # ===== FRONTEND =====
    ├── README.md                # Frontend docs
    ├── api-test.html            # API testing page
    │
    ├── views/                   # EJS Templates
    │   ├── index.ejs            # Trang chủ
    │   ├── login.ejs            # Đăng nhập
    │   ├── register.ejs         # Đăng ký
    │   ├── users.ejs            # Quản lý users
    │   ├── error.ejs            # Error page
    │   └── partials/
    │       ├── header.ejs
    │       └── footer.ejs
    │
    └── public/
        ├── css/
        │   └── style.css        # Custom styles
        └── js/                  # Client-side JS
```

---

## 🚀 Hướng dẫn Chạy

### Yêu cầu
- Node.js v14+
- MongoDB v4.4+
- npm hoặc yarn

### Cài đặt và Chạy

```bash
# 1. Cài đặt dependencies
npm install

# 2. Copy .env.example thành .env và cấu hình
cp .env.example .env

# 3. Chạy MongoDB (nếu chưa chạy)
# Windows: net start MongoDB
# Mac/Linux: sudo systemctl start mongod

# 4. Tạo dữ liệu mẫu
npm run seed

# 5. Chạy ứng dụng
npm start
```

**Truy cập:** http://localhost:3000

### Các cách chạy khác

```bash
# Chạy full-stack (frontend + backend)
npm start
npm run fullstack

# Chạy riêng backend API
npm run backend

# Test API
# Mở frontend/api-test.html trong browser
```

---

## 🔐 Tài khoản Test

### Admin
```
Username: admin
Password: admin123
```

### Users thường
```
Username: nguyenvana, tranthib, nguyenvanc, levand
Password: 123456
```

---

## 📸 Screenshots & Demo

### Trang chủ - Dashboard
- Form thêm task (sidebar trái)
- Danh sách tasks với progress bar
- Thống kê (tổng tasks, hoàn thành, %)
- Task cards với badges (priority, status)

### Task Card Features
- Checkbox đánh dấu hoàn thành
- Progress bar (task nhiều người)
- Danh sách assignees với status
- Nút phân công (admin)
- Nút xóa
- Thông tin: ngày tạo, deadline, ngày hoàn thành

### Quản lý Users (Admin)
- Table danh sách users
- Thay đổi role (Admin ↔ Normal)
- Xóa users

### API Testing Page
- Test tất cả API endpoints
- Xem JSON response
- Không cần Postman

---

## 🎯 Luồng hoạt động chính

### Luồng 1: User thường tạo và hoàn thành task
1. Login với `nguyenvana/123456`
2. Điền form "Thêm công việc mới"
3. Click "Thêm công việc"
4. Task xuất hiện trong danh sách
5. Click nút ⭕ để đánh dấu hoàn thành
6. Task chuyển sang completed, có gạch ngang

### Luồng 2: Admin phân công task cho nhiều người
1. Login với `admin/admin123`
2. Tạo task "Review code"
3. Click nút 👤+ bên task
4. Chọn user "Trần Thị B"
5. Click "Phân công"
6. Lặp lại để thêm "Nguyễn Văn C"
7. Task có 2 assignees, progress bar 0%
8. Logout, login với `tranthib/123456`
9. Đánh dấu hoàn thành → Progress 50%
10. Login với `nguyenvanc/123456`
11. Đánh dấu hoàn thành → Progress 100%, task completed!

### Luồng 3: Admin quản lý users
1. Login với `admin/admin123`
2. Click "Quản lý Users" trên navbar
3. Thấy danh sách 5 users
4. Click nút ⬆️ bên user "Nguyễn Văn A"
5. User A được nâng lên Admin
6. Logout, login lại với `nguyenvana/123456`
7. Thấy menu "Quản lý Users" xuất hiện

---

## 📡 API Endpoints Chính

### Level 1 Requirements

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks/all` | GET | Lấy tất cả tasks |
| `/api/tasks/by-username/:username` | GET | Lấy tasks theo username |
| `/api/tasks/today` | GET | Tasks trong ngày hiện tại |
| `/api/tasks/incomplete` | GET | Tasks chưa hoàn thành |
| `/api/tasks/by-nguyen` | GET | Tasks của users họ 'Nguyễn' |

### Additional APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/register` | POST | Đăng ký user (password hashed) |
| `/api/users/login` | POST | Đăng nhập |
| `/api/tasks/create` | POST | Tạo task mới |
| `/api/tasks/:id/assign` | POST | Gán task (admin) |
| `/api/tasks/:id/complete` | POST | Đánh dấu hoàn thành |
| `/api/users/all` | GET | Lấy tất cả users |

**Chi tiết:** Xem [backend/README.md](backend/README.md)

---

## 💾 Database Schema

### Collection: `users`

```javascript
{
  _id: ObjectId,
  username: String (unique, required, min 3 chars),
  password: String (hashed with bcryptjs, required, min 6 chars),
  firstName: String (required),
  lastName: String (required),
  email: String (optional),
  role: String (enum: ['admin', 'normal'], default: 'normal'),
  createdAt: Date (default: now)
}
```

### Collection: `tasks`

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (optional),
  createdBy: ObjectId (ref: User),
  assignees: [
    {
      user: ObjectId (ref: User),
      isCompleted: Boolean (default: false),
      completedAt: Date (default: null)
    }
  ],
  status: String (enum: ['pending', 'in-progress', 'completed']),
  completedAt: Date (default: null),
  createdAt: Date (default: now),
  dueDate: Date (optional),
  priority: String (enum: ['low', 'medium', 'high'], default: 'medium')
}
```

---

## 🛠️ Technologies

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **dotenv** - Environment variables

### Frontend
- **EJS** - Template engine
- **Bootstrap 5** - CSS framework
- **Bootstrap Icons** - Icons
- **Vanilla JavaScript** - Client-side scripting

---

## 📝 Kết quả đạt được

### Level 1: APIs ✅
- ✅ 5/5 API endpoints hoạt động đúng
- ✅ Password được hash an toàn
- ✅ Username unique validation
- ✅ Queries phức tạp (today, incomplete, by-nguyen)

### Level 2: Frontend ✅
- ✅ Giao diện đẹp, responsive
- ✅ Progress bar Bootstrap
- ✅ CRUD tasks đầy đủ
- ✅ Flash messages
- ✅ Form validation

### Level 3: Advanced Features ✅
- ✅ Role-based access control
- ✅ Multi-user task collaboration
- ✅ Complex completion logic
- ✅ Admin panel quản lý users
- ✅ Dynamic permission checks

---

## 🎓 Điểm nổi bật

1. **Kiến trúc rõ ràng**: Tách biệt backend/frontend
2. **Security**: Password hashing, session management
3. **UX tốt**: Progress bars, flash messages, animations
4. **Scalable**: Dễ mở rộng thêm features
5. **Documentation đầy đủ**: README, API docs, user guide
6. **Testing**: API test page included
7. **Production-ready**: Error handling, validation

---

## 📚 Tài liệu tham khảo

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [EJS Documentation](https://ejs.co/)
- [Bootstrap Documentation](https://getbootstrap.com/)

---

## 📧 Liên hệ

[Email của bạn]  
[SĐT của bạn]

---

**Ngày hoàn thành:** 13/02/2026  
**Link GitHub:** [Điền link repository của bạn]

---

## 🎬 Demo Video/GIF

[Đính kèm file GIF hoặc link video demo các chức năng]

**Nội dung demo nên bao gồm:**
1. Login/Logout
2. Tạo task mới
3. Đánh dấu hoàn thành task
4. Admin phân công task cho nhiều người
5. Progress bar cập nhật khi users complete
6. Quản lý users (thay đổi role)
7. Test 1-2 API endpoints

---

## ✨ Future Improvements

- [ ] Add real-time updates với Socket.io
- [ ] Export tasks to PDF/Excel
- [ ] Email notifications
- [ ] Task comments/attachments
- [ ] Calendar view
- [ ] Dark mode
- [ ] Mobile app với React Native
