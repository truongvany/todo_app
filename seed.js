/**
 * Script tạo dữ liệu mẫu cho Todo List App
 * Chạy: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Task = require('./backend/models/Task');

const seedData = async () => {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo_db');
        console.log('✅ Kết nối MongoDB thành công');

        // Xóa dữ liệu cũ
        await User.deleteMany({});
        await Task.deleteMany({});
        console.log('🗑️ Đã xóa dữ liệu cũ');

        // Tạo users
        const users = await User.create([
            {
                username: 'admin',
                password: 'admin123',
                firstName: 'Nguyễn',
                lastName: 'Admin',
                email: 'admin@example.com',
                role: 'admin'
            },
            {
                username: 'nguyenvana',
                password: '123456',
                firstName: 'Nguyễn',
                lastName: 'Văn A',
                email: 'nguyenvana@example.com',
                role: 'normal'
            },
            {
                username: 'tranthib',
                password: '123456',
                firstName: 'Trần',
                lastName: 'Thị B',
                email: 'tranthib@example.com',
                role: 'normal'
            },
            {
                username: 'nguyenvanc',
                password: '123456',
                firstName: 'Nguyễn',
                lastName: 'Văn C',
                email: 'nguyenvanc@example.com',
                role: 'normal'
            },
            {
                username: 'levand',
                password: '123456',
                firstName: 'Lê',
                lastName: 'Văn D',
                email: 'levand@example.com',
                role: 'normal'
            }
        ]);

        console.log(`✅ Đã tạo ${users.length} users`);

        const [admin, userA, userB, userC, userD] = users;

        // Tạo tasks
        const tasks = await Task.create([
            {
                title: 'Hoàn thành bài tập JavaScript',
                description: 'Làm bài tập Todo List với Node.js và MongoDB',
                createdBy: admin._id,
                assignees: [
                    { user: admin._id, isCompleted: true, completedAt: new Date() },
                    { user: userA._id, isCompleted: false }
                ],
                status: 'in-progress',
                priority: 'high',
                dueDate: new Date('2026-02-22')
            },
            {
                title: 'Học MongoDB',
                description: 'Tìm hiểu về NoSQL và MongoDB',
                createdBy: userA._id,
                assignees: [
                    { user: userA._id, isCompleted: true, completedAt: new Date() }
                ],
                status: 'completed',
                completedAt: new Date(),
                priority: 'medium'
            },
            {
                title: 'Viết tài liệu API',
                description: 'Tạo document mô tả các API endpoints',
                createdBy: admin._id,
                assignees: [
                    { user: userB._id, isCompleted: false },
                    { user: userC._id, isCompleted: false }
                ],
                status: 'pending',
                priority: 'medium',
                dueDate: new Date('2026-02-25')
            },
            {
                title: 'Review code',
                description: 'Review và kiểm tra code của team',
                createdBy: userC._id,
                assignees: [
                    { user: userC._id, isCompleted: false }
                ],
                status: 'pending',
                priority: 'low'
            },
            {
                title: 'Họp team hàng tuần',
                description: 'Họp báo cáo tiến độ công việc',
                createdBy: admin._id,
                assignees: [
                    { user: admin._id, isCompleted: true, completedAt: new Date() },
                    { user: userA._id, isCompleted: true, completedAt: new Date() },
                    { user: userB._id, isCompleted: true, completedAt: new Date() }
                ],
                status: 'completed',
                completedAt: new Date(),
                priority: 'high'
            },
            {
                title: 'Tạo giao diện EJS',
                description: 'Thiết kế frontend với Bootstrap và EJS',
                createdBy: userA._id,
                assignees: [
                    { user: userA._id, isCompleted: true, completedAt: new Date() }
                ],
                status: 'completed',
                completedAt: new Date(),
                priority: 'high',
                createdAt: new Date() // Task hôm nay
            },
            {
                title: 'Test chức năng đăng nhập',
                description: 'Kiểm tra login/logout',
                createdBy: userD._id,
                assignees: [
                    { user: userD._id, isCompleted: false }
                ],
                status: 'in-progress',
                priority: 'medium',
                createdAt: new Date() // Task hôm nay
            }
        ]);

        console.log(`✅ Đã tạo ${tasks.length} tasks`);

        console.log('\n📋 Thông tin đăng nhập:');
        console.log('================================');
        console.log('Admin:');
        console.log('  Username: admin');
        console.log('  Password: admin123');
        console.log('');
        console.log('User thường:');
        console.log('  Username: nguyenvana, tranthib, nguyenvanc, levand');
        console.log('  Password: 123456');
        console.log('================================');

        await mongoose.connection.close();
        console.log('\n✅ Hoàn tất! Đóng kết nối MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

seedData();
