/**
 * Backend Server Entry Point
 * Chạy: cd backend && npm start
 */

require('dotenv').config({ path: '../.env' });
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║       🔧 TODO LIST BACKEND API             ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  Server:  http://localhost:${PORT}            ║`);
    console.log('║  Status:  Running                          ║');
    console.log('║  Mode:    Backend Only                     ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('\n📡 API Endpoints:');
    console.log('   GET  /api/tasks/all          - Lấy tất cả tasks');
    console.log('   GET  /api/tasks/today        - Tasks hôm nay');
    console.log('   GET  /api/tasks/incomplete   - Tasks chưa hoàn thành');
    console.log('   POST /api/tasks/create       - Tạo task mới');
    console.log('   POST /api/users/register     - Đăng ký user');
    console.log('   POST /api/users/login        - Đăng nhập');
});
