const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware để xác thực JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                message: 'Access token is required',
                error: 'UNAUTHORIZED' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Tìm user và populate roles với permissions
        const user = await User.findById(decoded.userId)
            .populate({
                path: 'roles',
                populate: {
                    path: 'permissions',
                    model: 'Permission'
                }
            })
            .select('-password');

        if (!user || !user.isActive) {
            return res.status(401).json({ 
                message: 'User not found or inactive',
                error: 'UNAUTHORIZED' 
            });
        }

        // Thêm user info vào request
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Invalid token',
                error: 'INVALID_TOKEN' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired',
                error: 'TOKEN_EXPIRED' 
            });
        }

        return res.status(500).json({ 
            message: 'Authentication failed',
            error: error.message 
        });
    }
};

module.exports = authenticateToken;
