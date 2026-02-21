const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Tiêu đề task là bắt buộc'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    // User tạo task
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Danh sách người được gán task (Level 3)
    assignees: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        completedAt: {
            type: Date,
            default: null
        },
        isCompleted: {
            type: Boolean,
            default: false
        }
    }],
    // Trạng thái tổng thể của task
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    // Thời gian hoàn thành task (khi tất cả assignees hoàn thành)
    completedAt: {
        type: Date,
        default: null
    },
    // Ngày tạo task
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Ngày đến hạn
    dueDate: {
        type: Date,
        default: null
    },
    // Độ ưu tiên
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
});

// Kiểm tra task đã hoàn thành chưa (tất cả assignees phải hoàn thành)
taskSchema.methods.checkCompletion = function() {
    if (this.assignees.length === 0) {
        return false;
    }
    const allCompleted = this.assignees.every(assignee => assignee.isCompleted);
    if (allCompleted) {
        this.status = 'completed';
        this.completedAt = new Date();
    }
    return allCompleted;
};

// Tính % hoàn thành
taskSchema.methods.getCompletionPercentage = function() {
    if (this.assignees.length === 0) return 0;
    const completedCount = this.assignees.filter(a => a.isCompleted).length;
    return Math.round((completedCount / this.assignees.length) * 100);
};

// Static method để lấy task trong ngày (Level 1)
taskSchema.statics.getTasksToday = async function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.find({
        createdAt: {
            $gte: today,
            $lt: tomorrow
        }
    }).populate('createdBy', 'username firstName lastName');
};

// Static method để lấy task chưa hoàn thành (Level 1)
taskSchema.statics.getIncompleteTasks = async function() {
    return this.find({
        status: { $ne: 'completed' }
    }).populate('createdBy', 'username firstName lastName');
};

module.exports = mongoose.model('Task', taskSchema);
