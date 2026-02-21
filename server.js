/**
 * Server Entry Point
 * Khởi động ứng dụng Todo List
 */

require('dotenv').config();
const app = require('./backend/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║       🚀 TODO LIST APPLICATION             ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  Server:  http://localhost:${PORT}            ║`);
    console.log('║  Status:  Running                          ║');
    console.log('╚════════════════════════════════════════════╝');
});
