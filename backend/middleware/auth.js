// Middleware kiểm tra đăng nhập
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    
    // Nếu là API request
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập'
        });
    }
    
    // Redirect đến trang login
    req.flash('error', 'Vui lòng đăng nhập để tiếp tục');
    res.redirect('/login');
};

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền thực hiện hành động này'
        });
    }
    
    req.flash('error', 'Bạn không có quyền truy cập');
    res.redirect('/');
};

// Middleware để thêm user info vào locals (cho views)
const addUserToLocals = (req, res, next) => {
    res.locals.user = req.session?.user || null;
    res.locals.isLoggedIn = !!req.session?.userId;
    next();
};

module.exports = {
    isAuthenticated,
    isAdmin,
    addUserToLocals
};
