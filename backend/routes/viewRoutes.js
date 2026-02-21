const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Trang chủ - hiển thị danh sách tasks
router.get('/', async (req, res) => {
    try {
        let tasks = [];
        let users = [];
        
        if (req.session.userId) {
            if (req.session.user?.role === 'admin') {
                // Admin thấy tất cả tasks
                tasks = await Task.find()
                    .populate('createdBy', 'username firstName lastName')
                    .populate('assignees.user', 'username firstName lastName role')
                    .sort({ createdAt: -1 });
                users = await User.find().select('-password');
            } else {
                // User thường chỉ thấy tasks liên quan đến họ
                tasks = await Task.find({
                    $or: [
                        { createdBy: req.session.userId },
                        { 'assignees.user': req.session.userId }
                    ]
                })
                    .populate('createdBy', 'username firstName lastName')
                    .populate('assignees.user', 'username firstName lastName role')
                    .sort({ createdAt: -1 });
            }
        }

        res.render('index', { tasks, users });
    } catch (error) {
        req.flash('error', 'Lỗi khi tải dữ liệu');
        res.render('index', { tasks: [], users: [] });
    }
});

// Trang đăng nhập
router.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('login');
});

// Xử lý đăng nhập
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            req.flash('error', 'Username hoặc password không đúng');
            return res.redirect('/login');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Username hoặc password không đúng');
            return res.redirect('/login');
        }

        req.session.userId = user._id;
        req.session.user = {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        };

        req.flash('success', `Chào mừng ${user.firstName} ${user.lastName}!`);
        res.redirect('/');
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra');
        res.redirect('/login');
    }
});

// Trang đăng ký
router.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('register');
});

// Xử lý đăng ký
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

        const user = new User({
            username,
            password,
            firstName,
            lastName,
            email,
            role: 'normal'
        });

        await user.save();

        req.flash('success', 'Đăng ký thành công! Vui lòng đăng nhập.');
        res.redirect('/login');
    } catch (error) {
        req.flash('error', error.message || 'Có lỗi xảy ra');
        res.redirect('/register');
    }
});

// Đăng xuất
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/login');
    });
});

// Thêm task mới
router.post('/tasks', isAuthenticated, async (req, res) => {
    try {
        const { title, description, dueDate, priority } = req.body;

        const task = new Task({
            title,
            description,
            createdBy: req.session.userId,
            assignees: [{
                user: req.session.userId,
                isCompleted: false
            }],
            dueDate: dueDate || null,
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

// Xóa task
router.delete('/tasks/:id', isAuthenticated, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            req.flash('error', 'Không tìm thấy task');
            return res.redirect('/');
        }

        // Chỉ người tạo hoặc admin mới được xóa
        if (task.createdBy.toString() !== req.session.userId.toString() && 
            req.session.user?.role !== 'admin') {
            req.flash('error', 'Bạn không có quyền xóa task này');
            return res.redirect('/');
        }

        await Task.findByIdAndDelete(req.params.id);
        req.flash('success', 'Xóa task thành công!');
        res.redirect('/');
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra');
        res.redirect('/');
    }
});

// Đánh dấu hoàn thành/chưa hoàn thành
router.post('/tasks/:id/toggle', isAuthenticated, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            req.flash('error', 'Không tìm thấy task');
            return res.redirect('/');
        }

        const assigneeIndex = task.assignees.findIndex(
            a => a.user.toString() === req.session.userId.toString()
        );

        if (assigneeIndex === -1) {
            req.flash('error', 'Bạn không được gán task này');
            return res.redirect('/');
        }

        // Toggle trạng thái
        const isCurrentlyCompleted = task.assignees[assigneeIndex].isCompleted;
        task.assignees[assigneeIndex].isCompleted = !isCurrentlyCompleted;
        task.assignees[assigneeIndex].completedAt = isCurrentlyCompleted ? null : new Date();

        // Cập nhật status
        if (!isCurrentlyCompleted && task.status === 'pending') {
            task.status = 'in-progress';
        }

        // Kiểm tra tất cả hoàn thành
        task.checkCompletion();

        await task.save();

        req.flash('success', isCurrentlyCompleted ? 'Đã hủy hoàn thành' : 'Đã đánh dấu hoàn thành!');
        res.redirect('/');
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra');
        res.redirect('/');
    }
});

// Phân công task cho user khác (chỉ admin)
router.post('/tasks/:id/assign', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { assigneeId } = req.body;

        const task = await Task.findById(req.params.id);
        if (!task) {
            req.flash('error', 'Không tìm thấy task');
            return res.redirect('/');
        }

        const assignee = await User.findById(assigneeId);
        if (!assignee) {
            req.flash('error', 'Không tìm thấy user');
            return res.redirect('/');
        }

        // Kiểm tra đã được gán chưa
        const alreadyAssigned = task.assignees.some(
            a => a.user.toString() === assigneeId
        );

        if (alreadyAssigned) {
            req.flash('error', 'User đã được gán task này rồi');
            return res.redirect('/');
        }

        task.assignees.push({
            user: assigneeId,
            isCompleted: false
        });

        // Reset status nếu đang completed
        if (task.status === 'completed') {
            task.status = 'in-progress';
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

// Xóa assignee khỏi task (chỉ admin)
router.delete('/tasks/:id/assignee/:assigneeId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            req.flash('error', 'Không tìm thấy task');
            return res.redirect('/');
        }

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
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra');
        res.redirect('/');
    }
});

// Trang quản lý users (chỉ admin)
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.render('users', { users });
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra');
        res.redirect('/');
    }
});

// Thay đổi role user (chỉ admin)
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

// Xóa user (chỉ admin)
router.delete('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // Không cho xóa chính mình
        if (req.params.id === req.session.userId.toString()) {
            req.flash('error', 'Không thể xóa chính mình');
            return res.redirect('/users');
        }

        await User.findByIdAndDelete(req.params.id);
        // Cũng xóa các task của user này
        await Task.deleteMany({ createdBy: req.params.id });
        
        req.flash('success', 'Đã xóa user');
        res.redirect('/users');
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra');
        res.redirect('/users');
    }
});

module.exports = router;
