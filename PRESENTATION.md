# 🎬 TODO LIST APP – SCRIPT DEMO VIDEO BÁO CÁO

> **Sinh viên:** Trương Văn Ý  
> **Môn học:** JavaScript  
> **Ngày báo cáo:** 21/02/2026  
> **GitHub:** https://github.com/truongvany/todo_app  
> **Server:** http://localhost:3000

---

## MỤC LỤC DEMO

| # | Nội dung | Thời lượng |
|---|----------|-----------|
| 1 | Khởi động & giới thiệu app | ~30 giây |
| 2 | Đăng ký / Đăng nhập / Đăng xuất | ~1 phút |
| 3 | Tạo task mới | ~45 giây |
| 4 | Đánh dấu hoàn thành task + progress bar | ~1 phút |
| 5 | Admin phân công task cho nhiều người | ~1.5 phút |
| 6 | Progress bar cập nhật khi users hoàn thành | ~1 phút |
| 7 | Quản lý users – thay đổi role | ~45 giây |
| 8 | Test API với Postman | ~1.5 phút |
| **Tổng** | | **~8 phút** |

---

---

## 🔷 BƯỚC 1 – KHỞI ĐỘNG ỨNG DỤNG

### Thao tác

Mở terminal, chạy:

```bash
cd backend
npm start
```

### Kết quả trên màn hình

```
╔════════════════════════════════════════════╗
║       🔧 TODO LIST BACKEND API             ║
╠════════════════════════════════════════════╣
║  Server:  http://localhost:3000            ║
║  Status:  Running                          ║
╚════════════════════════════════════════════╝
```

### Lời nói

> *"Ứng dụng Todo List được xây dựng bằng **Node.js + Express** ở backend, **MongoDB** lưu dữ liệu, **EJS** render giao diện và **Bootstrap 5** cho UI. Server khởi động tại cổng 3000."*

---

---

## 🔷 BƯỚC 2 – ĐĂNG KÝ / ĐĂNG NHẬP / ĐĂNG XUẤT

### 2.1 Đăng ký tài khoản

**URL:** http://localhost:3000/register  
**Thao tác:** Điền form → Submit

**Code xử lý** (`backend/routes/viewRoutes.js`):

```javascript
router.post('/register', async (req, res) => {
    try {
        const { username, password, confirmPassword, firstName, lastName, email } = req.body;

        if (password !== confirmPassword) {
            req.flash('error', 'Mật khẩu xác nhận không khớp');
            return res.redirect('/register');
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            req.flash('error', 'Username đã tồn tại');
            return res.redirect('/register');
        }

        const user = new User({ username, password, firstName, lastName, email, role: 'normal' });
        await user.save();  // ← password tự động hash tại đây

        req.flash('success', 'Đăng ký thành công! Vui lòng đăng nhập.');
        res.redirect('/login');
    } catch (error) {
        req.flash('error', error.message || 'Có lỗi xảy ra');
        res.redirect('/register');
    }
});
```

**Code mã hóa password** (`backend/models/User.js`):

```javascript
// Hook tự động chạy TRƯỚC khi lưu vào MongoDB
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // "123456" → "$2a$10$N9qo8uLOickgx2ZMRZoMye..."
});
```

### 2.2 Đăng nhập

**URL:** http://localhost:3000/login  
**Thao tác:** Nhập username + password → Login

**Code xử lý** (`backend/routes/viewRoutes.js`):

```javascript
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            req.flash('error', 'Username hoặc password không đúng');
            return res.redirect('/login');
        }

        const isMatch = await user.comparePassword(password);
        // bcrypt.compare("123456", "$2a$10$...hash...") → true/false
        if (!isMatch) {
            req.flash('error', 'Username hoặc password không đúng');
            return res.redirect('/login');
        }

        req.session.userId = user._id;
        req.session.user   = { id: user._id, username: user.username,
                               firstName: user.firstName, lastName: user.lastName,
                               role: user.role };
        req.flash('success', `Chào mừng ${user.firstName} ${user.lastName}!`);
        res.redirect('/');
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra');
        res.redirect('/login');
    }
});
```

**comparePassword helper** (`backend/models/User.js`):

```javascript
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
    // Không cần giải mã — bcrypt so sánh bằng cách hash lại rồi đối chiếu
};
```

### 2.3 Đăng xuất

**Thao tác:** Click nút **Đăng xuất** trên navbar

**Code xử lý:**

```javascript
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/login');   // hủy session → về trang login
    });
});
```

### Lời nói

> *"Mật khẩu không bao giờ lưu dạng gốc. bcryptjs dùng cost factor 10, tức 2^10 = 1024 vòng lặp để tạo hash — chống brute-force hiệu quả. Khi đăng nhập, `bcrypt.compare()` tự hash mật khẩu nhập vào rồi so sánh, không cần giải mã."*

---

---

## 🔷 BƯỚC 3 – TẠO TASK MỚI

**URL:** http://localhost:3000/ (sau khi đăng nhập)  
**Thao tác:** Điền form "Thêm task mới" → chọn độ ưu tiên → Submit

**Code xử lý** (`backend/routes/viewRoutes.js`):

```javascript
router.post('/tasks', isAuthenticated, async (req, res) => {
    try {
        const { title, description, dueDate, priority } = req.body;

        const task = new Task({
            title,
            description,
            createdBy: req.session.userId,    // user hiện tại là chủ task
            assignees: [{
                user: req.session.userId,     // tự gán cho chính mình
                isCompleted: false
            }],
            dueDate:  dueDate || null,
            priority: priority || 'medium'
        });

        await task.save();
        req.flash('success', 'Tạo task thành công!');
        res.redirect('/');
    } catch (error) {
        req.flash('error', error.message || 'Có lỗi xảy ra');
        res.redirect('/');
    }
});
```

**Task Schema** (`backend/models/Task.js`):

```javascript
const taskSchema = new mongoose.Schema({
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignees: [{
        user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date, default: null }
    }],
    status:   { type: String, enum: ['pending','in-progress','completed'], default: 'pending' },
    priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
    dueDate:  { type: Date, default: null },
    createdAt:{ type: Date, default: Date.now }
});
```

### Lời nói

> *"Middleware `isAuthenticated` đảm bảo chỉ người đã đăng nhập mới tạo được task. User hiện tại vừa là `createdBy` (chủ sở hữu) vừa là assignee đầu tiên trong mảng `assignees`."*

---

---

## 🔷 BƯỚC 4 – ĐÁNH DẤU HOÀN THÀNH + PROGRESS BAR

### 4.1 Toggle hoàn thành

**Thao tác:** Click nút ✓ bên cạnh task

**Code xử lý** (`backend/routes/viewRoutes.js`):

```javascript
router.post('/tasks/:id/toggle', isAuthenticated, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        const assigneeIndex = task.assignees.findIndex(
            a => a.user.toString() === req.session.userId.toString()
        );

        if (assigneeIndex === -1) {
            req.flash('error', 'Bạn không được gán task này');
            return res.redirect('/');
        }

        const isCurrentlyCompleted = task.assignees[assigneeIndex].isCompleted;
        task.assignees[assigneeIndex].isCompleted  = !isCurrentlyCompleted;
        task.assignees[assigneeIndex].completedAt  = isCurrentlyCompleted ? null : new Date();

        if (!isCurrentlyCompleted && task.status === 'pending') {
            task.status = 'in-progress';
        }

        task.checkCompletion();  // TẤT CẢ assignees xong → status = 'completed'
        await task.save();

        req.flash('success', isCurrentlyCompleted ? 'Đã hủy hoàn thành' : 'Đã đánh dấu hoàn thành!');
        res.redirect('/');
    } catch (error) { res.redirect('/'); }
});
```

**Logic checkCompletion** (`backend/models/Task.js`):

```javascript
taskSchema.methods.checkCompletion = function() {
    if (this.assignees.length === 0) return false;
    const allCompleted = this.assignees.every(a => a.isCompleted);
    if (allCompleted) {
        this.status      = 'completed';
        this.completedAt = new Date();
    }
    return allCompleted;
};

// Tính % hoàn thành dựa trên số assignees đã xong
taskSchema.methods.getCompletionPercentage = function() {
    if (this.assignees.length === 0) return 0;
    const done = this.assignees.filter(a => a.isCompleted).length;
    return Math.round((done / this.assignees.length) * 100);
};
```

### 4.2 Progress Bar Bootstrap 5

**Code hiển thị** (`frontend/views/index.ejs`):

```html
<%
  const total     = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const percent   = total > 0 ? Math.round((completed / total) * 100) : 0;

  let barColor = 'bg-danger';                        // 0–39%  → đỏ
  if (percent >= 75)      barColor = 'bg-success';   // 75–100% → xanh
  else if (percent >= 40) barColor = 'bg-warning';   // 40–74% → vàng
%>

<div class="progress" style="height: 22px; border-radius: 50px;">
  <div class="progress-bar <%= barColor %>"
       role="progressbar"
       style="width: <%= percent %>%"
       aria-valuenow="<%= percent %>"
       aria-valuemin="0" aria-valuemax="100">
    <%= percent %>%
  </div>
</div>
<p class="text-muted small mt-1">
  <strong><%= completed %></strong> / <strong><%= total %></strong> công việc hoàn thành
</p>
```

### Lời nói

> *"`checkCompletion()` duyệt toàn bộ mảng `assignees` — chỉ khi TẤT CẢ đều `isCompleted = true` thì task mới chuyển sang `completed`. Progress bar dùng pattern Post/Redirect/Get: sau mỗi toggle, server redirect về GET /, EJS tính lại % và render màu mới."*

---

---

## 🔷 BƯỚC 5 – ADMIN PHÂN CÔNG TASK CHO NHIỀU NGƯỜI

**Yêu cầu:** Đăng nhập bằng tài khoản **Admin**  
**Thao tác:** Nhấn nút **Phân công** → chọn user trong modal → Submit

**Code xử lý phân công** (`backend/routes/viewRoutes.js`):

```javascript
// Chỉ admin mới được phân công (middleware isAdmin kiểm tra)
router.post('/tasks/:id/assign', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { assigneeId } = req.body;

        const task     = await Task.findById(req.params.id);
        const assignee = await User.findById(assigneeId);

        // Kiểm tra user đã được gán chưa
        const alreadyAssigned = task.assignees.some(
            a => a.user.toString() === assigneeId
        );
        if (alreadyAssigned) {
            req.flash('error', 'User đã được gán task này rồi');
            return res.redirect('/');
        }

        task.assignees.push({ user: assigneeId, isCompleted: false });

        // Nếu task đang completed → reset về in-progress
        if (task.status === 'completed') {
            task.status      = 'in-progress';
            task.completedAt = null;
        }

        await task.save();
        req.flash('success', `Đã phân công task cho ${assignee.firstName} ${assignee.lastName}`);
        res.redirect('/');
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra');
        res.redirect('/');
    }
});
```

**Middleware isAdmin** (`backend/middleware/auth.js`):

```javascript
const isAdmin = (req, res, next) => {
    if (req.session.user?.role === 'admin') {
        return next();  // có quyền → cho đi tiếp
    }
    req.flash('error', 'Bạn không có quyền Admin');
    res.redirect('/');
};
```

**Code xóa assignee khỏi task** (`backend/routes/viewRoutes.js`):

```javascript
router.delete('/tasks/:id/assignee/:assigneeId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task.assignees.length <= 1) {
            req.flash('error', 'Task phải có ít nhất 1 người được gán');
            return res.redirect('/');
        }

        task.assignees = task.assignees.filter(
            a => a.user.toString() !== req.params.assigneeId
        );

        task.checkCompletion();
        await task.save();
        req.flash('success', 'Đã xóa người được gán');
        res.redirect('/');
    } catch (error) { res.redirect('/'); }
});
```

### Lời nói

> *"Chỉ Admin mới thấy nút 'Phân công'. Mỗi lần phân công, một object `{ user: ObjectId, isCompleted: false }` được push vào mảng `assignees`. Task có thể có nhiều người được gán, nhưng chỉ khi TẤT CẢ đều xong thì `status` mới là `completed`."*

---

---

## 🔷 BƯỚC 6 – PROGRESS BAR CẬP NHẬT KHI USERS HOÀN THÀNH

### Kịch bản demo

1. Admin phân công 1 task cho **3 users**: userA, userB, userC
2. Đăng nhập lần lượt từng user → nhấn nút ✓
3. Quan sát progress bar thay đổi sau mỗi lần toggle

### Trạng thái progress bar theo số người hoàn thành

| Người xong | Tổng assignees | % | Màu bar | Status task |
|-----------|---------------|---|---------|------------|
| 0 / 3 | 3 | 0% | 🔴 Đỏ | `pending` |
| 1 / 3 | 3 | 33% | 🔴 Đỏ | `in-progress` |
| 2 / 3 | 3 | 67% | 🟡 Vàng | `in-progress` |
| 3 / 3 | 3 | 100% | 🟢 Xanh | `completed` ✅ |

### Logic tính % trong EJS

```javascript
// Server tính lại mỗi lần trang POST/Redirect/GET
const total     = tasks.length;
const completed = tasks.filter(t => t.status === 'completed').length;
const percent   = total > 0 ? Math.round((completed / total) * 100) : 0;
```

### Lời nói

> *"Progress bar không dùng JavaScript phía client để realtime — thay vào đó ứng dụng dùng pattern **Post/Redirect/Get**: sau mỗi hành động, server redirect về GET /, EJS tính lại toàn bộ số liệu và render lại. Đây là cách đơn giản, không cần AJAX."*

---

---

## 🔷 BƯỚC 7 – QUẢN LÝ USERS (ĐỔI ROLE)

**URL:** http://localhost:3000/users  
**Yêu cầu:** Đăng nhập Admin  
**Thao tác:** Chọn role mới → Submit / Click Xóa user

**Code thay đổi role** (`backend/routes/viewRoutes.js`):

```javascript
// Lấy danh sách users — .select('-password') loại bỏ trường password
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.render('users', { users });
    } catch (error) { res.redirect('/'); }
});

// Cập nhật role: "normal" ↔ "admin"
router.post('/users/:id/role', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        await User.findByIdAndUpdate(req.params.id, { role });
        req.flash('success', 'Đã cập nhật quyền user');
        res.redirect('/users');
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra');
        res.redirect('/users');
    }
});

// Xóa user + toàn bộ task của họ (cascade delete)
router.delete('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        if (req.params.id === req.session.userId.toString()) {
            req.flash('error', 'Không thể xóa chính mình');
            return res.redirect('/users');
        }

        await User.findByIdAndDelete(req.params.id);
        await Task.deleteMany({ createdBy: req.params.id }); // xóa task đi kèm

        req.flash('success', 'Đã xóa user');
        res.redirect('/users');
    } catch (error) { res.redirect('/users'); }
});
```

### Lời nói

> *"Khi xóa user, hệ thống cũng tự động xóa luôn các task của user đó bằng `Task.deleteMany({ createdBy: req.params.id })` — tránh dữ liệu mồ côi trong MongoDB."*

---

---

## 🔷 BƯỚC 8 – TEST API VỚI POSTMAN

### API 1 – getAllTasks (`GET /api/tasks/all`)

**Code backend** (`backend/routes/taskRoutes.js`):

```javascript
router.get('/all', async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('createdBy', 'username firstName lastName')
            // populate: thay ObjectId → document thực từ collection users
            .sort({ createdAt: -1 });  // mới nhất lên đầu

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});
```

**Response mẫu:**

```json
{
  "success": true,
  "count": 3,
  "tasks": [
    {
      "_id": "65f2b3c4d5e6f7a8b9c0d1e2",
      "title": "Học Node.js",
      "status": "completed",
      "priority": "high",
      "createdAt": "2026-02-21T09:00:00.000Z",
      "createdBy": {
        "_id": "65f1a2b3...",
        "username": "nguyenvana",
        "firstName": "Nguyễn",
        "lastName": "Văn A"
      }
    }
  ]
}
```

---

### API 2 – Task của user họ Nguyễn (`GET /api/tasks/by-nguyen`)

**Code backend** (`backend/routes/taskRoutes.js`):

```javascript
router.get('/by-nguyen', async (req, res) => {
    try {
        // Bước 1: tìm users có họ Nguyễn (regex không phân biệt hoa/thường)
        const nguyenUsers = await User.find({
            firstName: { $regex: /^nguyễn$/i }
        });

        if (nguyenUsers.length === 0) {
            return res.status(200).json({
                success: true, count: 0,
                message: 'Không có user nào có họ Nguyễn', tasks: []
            });
        }

        // Bước 2: lấy _id của những users đó
        const nguyenUserIds = nguyenUsers.map(u => u._id);

        // Bước 3: lấy task có createdBy nằm trong danh sách _id
        const tasks = await Task.find({ createdBy: { $in: nguyenUserIds } })
            .populate('createdBy', 'username firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            nguyenUsers: nguyenUsers.map(u => ({
                username: u.username,
                fullName: `${u.firstName} ${u.lastName}`
            })),
            tasks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});
```

**Response mẫu:**

```json
{
  "success": true,
  "count": 2,
  "nguyenUsers": [
    { "username": "nguyenvana", "fullName": "Nguyễn Văn A" },
    { "username": "nguyenthib", "fullName": "Nguyễn Thị B" }
  ],
  "tasks": [
    { "title": "Học Node.js",         "createdBy": { "firstName": "Nguyễn", "lastName": "Văn A" } },
    { "title": "Nộp báo cáo cuối kỳ", "createdBy": { "firstName": "Nguyễn", "lastName": "Thị B" } }
  ]
}
```

> **Điểm nhấn khi demo:** Chạy thêm task cho `tranvanc` (họ Trần) rồi gọi API này lại — task Trần Văn C sẽ **không** xuất hiện trong kết quả.

---

---

## 📊 TỔNG KẾT

### Checklist demo

| Nội dung demo | Trạng thái | File code chính |
|--------------|-----------|----------------|
| Login / Logout | ✅ | `viewRoutes.js` – POST /login, GET /logout |
| Tạo task mới | ✅ | `viewRoutes.js` – POST /tasks |
| Đánh dấu hoàn thành | ✅ | `viewRoutes.js` – POST /tasks/:id/toggle |
| Admin phân công nhiều người | ✅ | `viewRoutes.js` – POST /tasks/:id/assign |
| Progress bar cập nhật | ✅ | `index.ejs` – tính % từ tasks.filter() |
| Quản lý users / đổi role | ✅ | `viewRoutes.js` – POST /users/:id/role |
| Test API Postman | ✅ | `taskRoutes.js`, `TodoList_Level1.postman_collection.json` |
| Mã hóa password bcrypt | ✅ | `User.js` – pre-save hook |
| Username duy nhất | ✅ | `User.js` – `unique: true` |

### Cấu trúc thư mục chính

```
backend/
├── models/
│   ├── User.js          ← Schema + bcrypt hook + comparePassword()
│   └── Task.js          ← Schema + checkCompletion() + getCompletionPercentage()
├── routes/
│   ├── viewRoutes.js    ← Route giao diện web (login, tasks, users, assign)
│   ├── taskRoutes.js    ← REST API /api/tasks/*
│   └── userRoutes.js    ← REST API /api/users/*
└── middleware/
    └── auth.js          ← isAuthenticated, isAdmin, addUserToLocals
```

### Công nghệ sử dụng

```
Node.js 20  ·  Express 4  ·  MongoDB 7  ·  Mongoose 8
bcryptjs 2  ·  EJS 3  ·  Bootstrap 5.3  ·  express-session
method-override  ·  connect-flash  ·  Postman
```

---

*Cảm ơn thầy/cô đã theo dõi – Trương Văn Ý – 21/02/2026*
