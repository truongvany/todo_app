const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');

// ==================== LEVEL 1 APIs ====================

// Lấy tất cả tasks (getAllTasks)
router.get('/all', async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('createdBy', 'username firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Lấy task theo tên user (Level 1: chỉ lấy task do user đó TẠO)
router.get('/by-username/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        const tasks = await Task.find({ createdBy: user._id })
            .populate('createdBy', 'username firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            username: req.params.username,
            tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Xuất các task trong ngày hiện tại
router.get('/today', async (req, res) => {
    try {
        const tasks = await Task.getTasksToday();
        res.status(200).json({
            success: true,
            count: tasks.length,
            date: new Date().toLocaleDateString('vi-VN'),
            tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Xuất các task chưa hoàn thành
router.get('/incomplete', async (req, res) => {
    try {
        const tasks = await Task.getIncompleteTasks();
        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Xuất các task với những user có họ là 'Nguyễn'
router.get('/by-nguyen', async (req, res) => {
    try {
        // Tìm các user có họ là Nguyễn
        const nguyenUsers = await User.find({
            firstName: { $regex: /^nguyễn$/i }
        });

        if (nguyenUsers.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                message: 'Không có user nào có họ Nguyễn',
                tasks: []
            });
        }

        const nguyenUserIds = nguyenUsers.map(u => u._id);

        // Level 1: chỉ lấy task do user họ Nguyễn TẠO
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
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Tạo task mới
router.post('/create', async (req, res) => {
    try {
        const { title, description, dueDate, priority, userId } = req.body;

        // Kiểm tra user tồn tại
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        const task = new Task({
            title,
            description,
            createdBy: userId,   // Level 1: task chỉ thuộc về 1 user (người tạo)
            dueDate,
            priority: priority || 'medium'
        });

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'username firstName lastName');

        res.status(201).json({
            success: true,
            message: 'Tạo task thành công',
            task: populatedTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Lấy task theo ID
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('createdBy', 'username firstName lastName')
            .populate('assignees.user', 'username firstName lastName');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        res.status(200).json({
            success: true,
            task,
            completionPercentage: task.getCompletionPercentage()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Cập nhật task
router.put('/:id', async (req, res) => {
    try {
        const { title, description, dueDate, priority, status } = req.body;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, dueDate, priority, status },
            { new: true, runValidators: true }
        )
            .populate('createdBy', 'username firstName lastName')
            .populate('assignees.user', 'username firstName lastName');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật task thành công',
            task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Xóa task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy task'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Xóa task thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// ==================== LEVEL 3 APIs ====================

// Gán task cho user khác (chỉ admin)
router.post('/:id/assign', async (req, res) => {
    try {
        const { assigneeId, adminId } = req.body;

        // Kiểm tra admin
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Chỉ admin mới có quyền phân công task'
            });
        }

        // Kiểm tra user được gán
        const assignee = await User.findById(assigneeId);
        if (!assignee) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user để gán task'
            });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        // Kiểm tra xem user đã được gán chưa
        const alreadyAssigned = task.assignees.some(
            a => a.user.toString() === assigneeId
        );

        if (alreadyAssigned) {
            return res.status(400).json({
                success: false,
                message: 'User đã được gán task này rồi'
            });
        }

        // Thêm assignee mới
        task.assignees.push({
            user: assigneeId,
            isCompleted: false
        });

        if (task.status === 'completed') {
            task.status = 'in-progress';
            task.completedAt = null;
        }

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'username firstName lastName')
            .populate('assignees.user', 'username firstName lastName');

        res.status(200).json({
            success: true,
            message: `Đã gán task cho ${assignee.firstName} ${assignee.lastName}`,
            task: populatedTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Đánh dấu hoàn thành task (từng người)
router.post('/:id/complete', async (req, res) => {
    try {
        const { userId } = req.body;

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        // Tìm assignee trong task
        const assigneeIndex = task.assignees.findIndex(
            a => a.user.toString() === userId
        );

        if (assigneeIndex === -1) {
            return res.status(403).json({
                success: false,
                message: 'User không được gán với task này'
            });
        }

        // Đánh dấu hoàn thành cho user này
        task.assignees[assigneeIndex].isCompleted = true;
        task.assignees[assigneeIndex].completedAt = new Date();

        // Cập nhật status nếu đang pending
        if (task.status === 'pending') {
            task.status = 'in-progress';
        }

        // Kiểm tra tất cả đã hoàn thành chưa
        task.checkCompletion();

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'username firstName lastName')
            .populate('assignees.user', 'username firstName lastName');

        res.status(200).json({
            success: true,
            message: task.status === 'completed' 
                ? 'Task đã hoàn thành!' 
                : 'Đã ghi nhận hoàn thành của bạn',
            task: populatedTask,
            completionPercentage: populatedTask.getCompletionPercentage(),
            isFullyCompleted: task.status === 'completed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Hủy hoàn thành task
router.post('/:id/uncomplete', async (req, res) => {
    try {
        const { userId } = req.body;

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        const assigneeIndex = task.assignees.findIndex(
            a => a.user.toString() === userId
        );

        if (assigneeIndex === -1) {
            return res.status(403).json({
                success: false,
                message: 'User không được gán với task này'
            });
        }

        task.assignees[assigneeIndex].isCompleted = false;
        task.assignees[assigneeIndex].completedAt = null;
        
        // Reset status nếu đang completed
        if (task.status === 'completed') {
            task.status = 'in-progress';
            task.completedAt = null;
        }

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'username firstName lastName')
            .populate('assignees.user', 'username firstName lastName');

        res.status(200).json({
            success: true,
            message: 'Đã hủy hoàn thành',
            task: populatedTask,
            completionPercentage: populatedTask.getCompletionPercentage()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Xóa assignee khỏi task (chỉ admin)
router.delete('/:id/assignee/:assigneeId', async (req, res) => {
    try {
        const { adminId } = req.body;

        // Kiểm tra admin
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Chỉ admin mới có quyền xóa assignee'
            });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        // Không cho xóa nếu chỉ còn 1 assignee
        if (task.assignees.length <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Task phải có ít nhất 1 người được gán'
            });
        }

        task.assignees = task.assignees.filter(
            a => a.user.toString() !== req.params.assigneeId
        );

        // Cập nhật lại status
        task.checkCompletion();

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'username firstName lastName')
            .populate('assignees.user', 'username firstName lastName');

        res.status(200).json({
            success: true,
            message: 'Đã xóa assignee khỏi task',
            task: populatedTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

module.exports = router;
