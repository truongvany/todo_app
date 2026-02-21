require('dotenv').config({ path: '../.env' });
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

// Config
const connectDB = require('./config/database');

// Routes
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const viewRoutes = require('./routes/viewRoutes');

// Middleware
const { addUserToLocals } = require('./middleware/auth');

const app = express();

// Kết nối MongoDB
connectDB();

// Middleware cơ bản
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Static files từ frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key_todo_list',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 ngày
    }
}));

// Flash messages
app.use(flash());

// Middleware để thêm flash messages và user vào locals
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});
app.use(addUserToLocals);

// View engine - trỏ đến frontend/views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// View Routes
app.use('/', viewRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Có lỗi xảy ra',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Trang không tồn tại',
        error: {}
    });
});

module.exports = app;
