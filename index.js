// Load environment variables
require('dotenv').config();

var express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const logger = require('./middlewares/logger');
const contentTypeCheck = require('./middlewares/contentTypeCheck');
const authenticateToken = require('./middlewares/auth');
const { checkPermission } = require('./middlewares/permission');
const connectDB = require('./config/database');
const { seedAll } = require('./config/seeder');
const Book = require('./models/Book');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

// Kết nối MongoDB và seed initial data
connectDB().then(() => {
    // Seed initial data after successful connection
    seedAll().catch(console.error);
});

const app = express()
const port = process.env.PORT || 3000

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests, Postman)
        if (!origin) return callback(null, true);
        
        // Allow all origins in development
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        // In production, specify allowed origins
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:8080',
            'http://127.0.0.1:3000',
            // Add your production domains here
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions)); // Enable CORS
app.use(express.json()) // Middleware to parse JSON bodies
app.use(logger); // logger middleware to log requests
app.use(contentTypeCheck); //contentTypeCheck middleware to check Content-Type



//thêm swagger
const swaggerUi = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Books API',
            version: '1.0.0',
            description: 'API for managing books with CRUD operations, search, filtering, sorting and statistics'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'User ID'
                        },
                        username: {
                            type: 'string',
                            description: 'Username'
                        },
                        email: {
                            type: 'string',
                            description: 'Email address'
                        },
                        fullName: {
                            type: 'string',
                            description: 'Full name'
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'User active status'
                        },
                        roles: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Role'
                            }
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Role: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Role ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Role name'
                        },
                        description: {
                            type: 'string',
                            description: 'Role description'
                        },
                        permissions: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Permission'
                            }
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Role active status'
                        },
                        isSystem: {
                            type: 'boolean',
                            description: 'System role flag'
                        }
                    }
                },
                Permission: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Permission ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Permission name'
                        },
                        description: {
                            type: 'string',
                            description: 'Permission description'
                        },
                        resource: {
                            type: 'string',
                            description: 'Resource name'
                        },
                        action: {
                            type: 'string',
                            description: 'Action type'
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Permission active status'
                        }
                    }
                },
                Book: {
                    type: 'object',
                    properties: {
                        isbn: {
                            type: 'string',
                            description: 'Unique ISBN identifier'
                        },
                        title: {
                            type: 'string',
                            description: 'Book title'
                        },
                        author: {
                            type: 'string',
                            description: 'Book author(s)'
                        },
                        year: {
                            type: 'integer',
                            description: 'Publication year'
                        },
                        category: {
                            type: 'string',
                            description: 'Book category'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Book creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Book last update timestamp'
                        }
                    }
                },
                BookInput: {
                    type: 'object',
                    required: ['isbn', 'title', 'author', 'year', 'category'],
                    properties: {
                        isbn: {
                            type: 'string',
                            description: 'Unique ISBN identifier'
                        },
                        title: {
                            type: 'string',
                            description: 'Book title'
                        },
                        author: {
                            type: 'string',
                            description: 'Book author(s)'
                        },
                        year: {
                            type: 'integer',
                            description: 'Publication year'
                        },
                        category: {
                            type: 'string',
                            description: 'Book category'
                        }
                    }
                },
                BookUpdate: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'Book title'
                        },
                        author: {
                            type: 'string',
                            description: 'Book author(s)'
                        },
                        year: {
                            type: 'integer',
                            description: 'Publication year'
                        },
                        category: {
                            type: 'string',
                            description: 'Book category'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message'
                        }
                    }
                },
                Stats: {
                    type: 'object',
                    properties: {
                        totalBooks: {
                            type: 'integer',
                            description: 'Total number of books in the collection'
                        },
                        oldestBook: {
                            type: 'integer',
                            description: 'Year of the oldest book'
                        },
                        newestBook: {
                            type: 'integer',
                            description: 'Year of the newest book'
                        }
                    }
                }
            }
        }
    },
    apis: ['./index.js'] // Cập nhật để tham chiếu đúng file
}
const swaggerDocs = swaggerJsDoc(swaggerOptions)

// Swagger UI options to handle CORS
const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
        requestInterceptor: function(request) {
            request.headers['Access-Control-Allow-Origin'] = '*';
            return request;
        }
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions))

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Books API with Dynamic Role-Based Access Control',
        documentation: '/api-docs',
        health: '/health',
        version: '1.0.0'
    });
});

// Hàm seed dữ liệu mẫu
const seedData = async () => {
    try {
        const count = await Book.countDocuments();
        if (count === 0) {
            const sampleBooks = [
                {
                    "isbn": "B001",
                    "title": "Clean Code",
                    "author": "Robert C. Martin",
                    "year": 2008,
                    "category": "Programming"
                },
                {
                    "isbn": "B002",
                    "title": "The Pragmatic Programmer",
                    "author": "Andrew Hunt and David Thomas",
                    "year": 1999,
                    "category": "Programming"
                },
                {
                    "isbn": "B003",
                    "title": "Introduction to Algorithms",
                    "author": "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, and Clifford Stein",
                    "year": 2009,
                    "category": "Algorithms"
                },
                {
                    "isbn": "B004",
                    "title": "Design Patterns: Elements of Reusable Object-Oriented Software",
                    "author": "Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides",
                    "year": 1994,
                    "category": "Software Design"
                }
            ];
            
            await Book.insertMany(sampleBooks);
            console.log('📚 Sample books data inserted');
        }
    } catch (error) {
        console.error('❌ Error seeding data:', error);
    }
};

// Gọi hàm seed data
//seedData();

// ================================
// AUTHENTICATION ROUTES
// ================================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         description: Invalid credentials
 */
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }        // Tìm user và populate roles với permissions
        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+password') // Explicitly include password field
            .populate({
                path: 'roles',
                populate: {
                    path: 'permissions',
                    model: 'Permission'
                }
            });

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid credentials or account inactive' });
        }

        // Kiểm tra password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Tạo JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Cập nhật lastLogin
        user.lastLogin = new Date();
        await user.save();

        res.json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                roles: user.roles,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               fullName:
 *                 type: string
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Invalid input or user already exists
 *       '403':
 *         description: Insufficient permissions
 */
app.post('/auth/register', authenticateToken, checkPermission('USERS', 'CREATE'), async (req, res) => {
    try {
        const { username, email, password, fullName, roleIds } = req.body;

        if (!username || !email || !password || !fullName) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Kiểm tra user đã tồn tại
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

        // Validate roles nếu có
        let validRoles = [];
        if (roleIds && roleIds.length > 0) {
            validRoles = await Role.find({ _id: { $in: roleIds }, isActive: true });
            if (validRoles.length !== roleIds.length) {
                return res.status(400).json({ message: 'Some roles are invalid or inactive' });
            }
        } else {
            // Nếu không có role được chỉ định, gán role USER mặc định
            const defaultRole = await Role.findOne({ name: 'USER' });
            if (defaultRole) {
                validRoles = [defaultRole];
            }
        }

        // Tạo user mới
        const newUser = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            fullName,
            roles: validRoles.map(role => role._id)
        });

        const savedUser = await newUser.save();

        // Populate roles để trả về
        await savedUser.populate({
            path: 'roles',
            populate: {
                path: 'permissions',
                model: 'Permission'
            }
        });

        res.status(201).json({
            message: 'User created successfully',
            user: savedUser
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: 'Validation error', errors });
        }

        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 */
app.get('/auth/profile', authenticateToken, async (req, res) => {
    try {
        res.json({
            message: 'Profile retrieved successfully',
            user: req.user
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *               confirmPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *       '400':
 *         description: Invalid current password or password mismatch
 *       '401':
 *         description: Unauthorized
 */
app.put('/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match' });
        }

        // Tìm user với password (vì profile endpoint không include password)
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Kiểm tra current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Cập nhật password mới
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout (client-side token invalidation)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Logout successful
 *       '401':
 *         description: Unauthorized
 */
app.post('/auth/logout', authenticateToken, async (req, res) => {
    try {
        // Note: JWT là stateless, không thể invalidate trên server-side một cách đơn giản
        // Trong production, bạn có thể implement blacklist tokens hoặc sử dụng refresh tokens
        
        res.json({ 
            message: 'Logout successful. Please remove the token from client storage.',
            note: 'JWT tokens are stateless. For enhanced security, implement token blacklisting or use short-lived tokens with refresh tokens.'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *       '401':
 *         description: Unauthorized
 */
app.post('/auth/refresh-token', authenticateToken, async (req, res) => {
    try {
        const user = req.user;

        // Tạo token mới
        const newToken = jwt.sign(
            { 
                userId: user._id,
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            message: 'Token refreshed successfully',
            token: newToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /auth/verify-token:
 *   get:
 *     summary: Verify if token is valid
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         description: Token is invalid or expired
 */
app.get('/auth/verify-token', authenticateToken, async (req, res) => {
    try {
        res.json({
            valid: true,
            user: req.user,
            message: 'Token is valid'
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /auth/update-profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       '200':
 *         description: Profile updated successfully
 *       '400':
 *         description: Invalid input or email already exists
 *       '401':
 *         description: Unauthorized
 */
app.put('/auth/update-profile', authenticateToken, async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const userId = req.user._id;

        const updateData = {};
        
        if (fullName) {
            updateData.fullName = fullName.trim();
        }

        if (email) {
            // Kiểm tra email đã tồn tại (ngoại trừ user hiện tại)
            const existingUser = await User.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            updateData.email = email.toLowerCase();
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).populate({
            path: 'roles',
            populate: {
                path: 'permissions',
                model: 'Permission'
            }
        });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: 'Validation error', errors });
        }

        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset (placeholder endpoint)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       '200':
 *         description: Password reset instructions sent (if email exists)
 *       '400':
 *         description: Invalid email format
 */
app.post('/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Tìm user theo email
        const user = await User.findOne({ email: email.toLowerCase() });

        // Note: Trong thực tế, bạn sẽ:
        // 1. Tạo reset token
        // 2. Lưu token vào database với expiration time
        // 3. Gửi email với reset link
        // Ở đây chỉ là placeholder implementation

        // Luôn trả về success message để tránh email enumeration attack
        res.json({ 
            message: 'If an account with that email exists, password reset instructions have been sent.',
            note: 'This is a placeholder endpoint. In production, implement proper password reset flow with email service.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /auth/check-permissions:
 *   post:
 *     summary: Check if user has specific permissions
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource
 *               - action
 *             properties:
 *               resource:
 *                 type: string
 *               action:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Permission check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasPermission:
 *                   type: boolean
 *                 resource:
 *                   type: string
 *                 action:
 *                   type: string
 *       '401':
 *         description: Unauthorized
 */
app.post('/auth/check-permissions', authenticateToken, async (req, res) => {
    try {
        const { resource, action } = req.body;
        const user = req.user;

        if (!resource || !action) {
            return res.status(400).json({ message: 'Resource and action are required' });
        }

        // Collect all permissions from user's roles
        const userPermissions = [];
        
        if (user.roles && user.roles.length > 0) {
            user.roles.forEach(role => {
                if (role.permissions && role.permissions.length > 0) {
                    role.permissions.forEach(permission => {
                        if (permission.isActive) {
                            userPermissions.push({
                                resource: permission.resource,
                                action: permission.action,
                                name: permission.name
                            });
                        }
                    });
                }
            });
        }

        // Check if user has required permission
        const hasPermission = userPermissions.some(permission => {
            // MANAGE permission gives access to all actions on a resource
            if (permission.resource === resource.toUpperCase() && permission.action === 'MANAGE') {
                return true;
            }
            
            // Exact match for resource and action
            return permission.resource === resource.toUpperCase() && 
                   permission.action === action.toUpperCase();
        });

        res.json({
            hasPermission,
            resource: resource.toUpperCase(),
            action: action.toUpperCase(),
            userPermissions: userPermissions
        });
    } catch (error) {
        console.error('Check permissions error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// ================================
// USER MANAGEMENT ROUTES
// ================================

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 */
app.get('/users', authenticateToken, checkPermission('USERS', 'READ'), async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        if (pageNum < 1 || limitNum < 1) {
            return res.status(400).json({ message: 'Page and limit must be positive integers' });
        }

        const skip = (pageNum - 1) * limitNum;

        const users = await User.find()
            .populate({
                path: 'roles',
                populate: {
                    path: 'permissions',
                    model: 'Permission'
                }
            })
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments();

        res.json({
            users,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalUsers: total,
                hasNextPage: pageNum < Math.ceil(total / limitNum),
                hasPrevPage: pageNum > 1
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

//swagger
/**
 * @swagger
 * /books:
 *   get:
 *     summary: Retrieve a list of books with pagination
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of books per page
 *     responses:
 *       '200':
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   isbn:
 *                     type: string
 *                   title:
 *                     type: string
 *                   author:
 *                     type: string
 *                   year:
 *                     type: integer
 *                   category:
 *                     type: string
 */
// Route to get all books with pagination
app.get('/books', authenticateToken, checkPermission('BOOKS', 'READ'), async (req, res) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        
        // Validation
        if (pageNum < 1 || limitNum < 1) {
            return res.status(400).json({ message: 'Page and limit must be positive integers' });
        }
        
        const skip = (pageNum - 1) * limitNum;
        
        const books = await Book.find()
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất
            
        const total = await Book.countDocuments();
        
        res.json({
            books,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalBooks: total,
                hasNextPage: pageNum < Math.ceil(total / limitNum),
                hasPrevPage: pageNum > 1
            }
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})


/**
 * @swagger
 * /books/{isbn}:
 *   get:
 *     summary: Get a book by ISBN
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: string
 *         description: ISBN of the book to retrieve
 *     responses:
 *       '200':
 *         description: Book found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isbn:
 *                   type: string
 *                 title:
 *                   type: string
 *                 author:
 *                   type: string
 *                 year:
 *                   type: integer
 *                 category:
 *                   type: string
 *       '404':
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.get('/books/:isbn', authenticateToken, checkPermission('BOOKS', 'READ'), async (req, res) => {
    try {
        const book = await Book.findOne({ isbn: req.params.isbn });
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isbn
 *               - title
 *               - author
 *               - year
 *               - category
 *             properties:
 *               isbn:
 *                 type: string
 *                 description: Unique ISBN identifier
 *               title:
 *                 type: string
 *                 description: Book title
 *               author:
 *                 type: string
 *                 description: Book author(s)
 *               year:
 *                 type: integer
 *                 description: Publication year
 *               category:
 *                 type: string
 *                 description: Book category
 *     responses:
 *       '201':
 *         description: Book added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 book:
 *                   type: object
 *                   properties:
 *                     isbn:
 *                       type: string
 *                     title:
 *                       type: string
 *                     author:
 *                       type: string
 *                     year:
 *                       type: integer
 *                     category:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Invalid input or duplicate ISBN
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.post('/books', authenticateToken, checkPermission('BOOKS', 'CREATE'), async (req, res) => {
    try {
        const { isbn, title, author, year, category } = req.body;
        
        // Validation
        if (!isbn || !title || !author || !year || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Kiểm tra ISBN đã tồn tại
        const existingBook = await Book.findOne({ isbn });
        if (existingBook) {
            return res.status(400).json({ message: 'Book with this ISBN already exists' });
        }
        
        // Tạo sách mới
        const newBook = new Book({ isbn, title, author, year, category });
        const savedBook = await newBook.save();
        
        res.status(201).json({ 
            message: 'Book added successfully', 
            book: savedBook 
        });
    } catch (error) {
        console.error('Error adding book:', error);
        
        // Xử lý lỗi validation của Mongoose
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: 'Validation error', errors });
        }
        
        // Xử lý lỗi duplicate key
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Book with this ISBN already exists' });
        }
        
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})

/**
 * @swagger
 * /books/{isbn}:
 *   put:
 *     summary: Update a book by ISBN
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: string
 *         description: ISBN of the book to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Book title
 *               author:
 *                 type: string
 *                 description: Book author(s)
 *               year:
 *                 type: integer
 *                 description: Publication year
 *               category:
 *                 type: string
 *                 description: Book category
 *     responses:
 *       '200':
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 book:
 *                   type: object
 *                   properties:
 *                     isbn:
 *                       type: string
 *                     title:
 *                       type: string
 *                     author:
 *                       type: string
 *                     year:
 *                       type: integer
 *                     category:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       '404':
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.put('/books/:isbn', authenticateToken, checkPermission('BOOKS', 'UPDATE'), async (req, res) => {
    try {
        const { title, author, year, category } = req.body;
        
        // Tìm và cập nhật sách
        const updatedBook = await Book.findOneAndUpdate(
            { isbn: req.params.isbn },
            { 
                ...(title && { title }), 
                ...(author && { author }), 
                ...(year && { year }), 
                ...(category && { category }) 
            },
            { 
                new: true, // Trả về document đã được cập nhật
                runValidators: true // Chạy validation
            }
        );
        
        if (!updatedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        res.json({ 
            message: 'Book updated successfully', 
            book: updatedBook 
        });
    } catch (error) {
        console.error('Error updating book:', error);
        
        // Xử lý lỗi validation
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: 'Validation error', errors });
        }
        
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})

/**
 * @swagger
 * /books/{isbn}:
 *   delete:
 *     summary: Delete a book by ISBN
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: string
 *         description: ISBN of the book to delete
 *     responses:
 *       '200':
 *         description: Book deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '404':
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.delete('/books/:isbn', authenticateToken, checkPermission('BOOKS', 'DELETE'), async (req, res) => {
    try {
        const deletedBook = await Book.findOneAndDelete({ isbn: req.params.isbn });
        
        if (!deletedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        res.json({ 
            message: 'Book deleted successfully',
            deletedBook 
        });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})


/**
 * @swagger
 * /books/search:
 *   get:
 *     summary: Search books by category (case-insensitive)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category to search for
 *     responses:
 *       '200':
 *         description: List of books matching the category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   isbn:
 *                     type: string
 *                   title:
 *                     type: string
 *                   author:
 *                     type: string
 *                   year:
 *                     type: integer
 *                   category:
 *                     type: string
 *       '400':
 *         description: Category query parameter is required
 */
// Route to search books by category (case-insensitive)
app.get('/books/search', authenticateToken, checkPermission('BOOKS', 'READ'), async (req, res) => {
    try {
        const category = req.query.category?.toLowerCase();
        if (!category) {
            return res.status(400).json({ message: 'Category query parameter is required' });
        }
        
        const filteredBooks = await Book.find({ 
            category: { $regex: new RegExp(category, 'i') } 
        });
        
        res.json(filteredBooks);
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /books/sort:
 *   get:
 *     summary: Sort books by title or year
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: by
 *         required: true
 *         schema:
 *           type: string
 *           enum: [title, year]
 *         description: Field to sort by (title or year)
 *       - in: query
 *         name: order
 *         required: true
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc or desc)
 *     responses:
 *       '200':
 *         description: Sorted list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   isbn:
 *                     type: string
 *                   title:
 *                     type: string
 *                   author:
 *                     type: string
 *                   year:
 *                     type: integer
 *                   category:
 *                     type: string
 *       '400':
 *         description: Invalid sort parameters
 */
// Route to sort books by title or year
app.get('/books/sort', authenticateToken, checkPermission('BOOKS', 'READ'), async (req, res) => {
    try {
        const { by, order } = req.query;
        if (!['title', 'year'].includes(by) || !['asc', 'desc'].includes(order)) {
            return res.status(400).json({ message: 'Invalid sort parameters' });
        }
        
        const sortDirection = order === 'asc' ? 1 : -1;
        const sortedBooks = await Book.find().sort({ [by]: sortDirection });
        
        res.json(sortedBooks);
    } catch (error) {
        console.error('Error sorting books:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /books/filter:
 *   get:
 *     summary: Advanced filtering of books by author and/or year
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Author name to filter by (partial match, case-insensitive)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Publication year to filter by (exact match)
 *     responses:
 *       '200':
 *         description: Filtered list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   isbn:
 *                     type: string
 *                   title:
 *                     type: string
 *                   author:
 *                     type: string
 *                   year:
 *                     type: integer
 *                   category:
 *                     type: string
 */
// Route for advanced filtering
app.get('/books/filter', authenticateToken, checkPermission('BOOKS', 'READ'), async (req, res) => {
    try {
        const { author, year } = req.query;
        
        // Xây dựng query object
        const query = {};
        if (author) {
            query.author = { $regex: new RegExp(author, 'i') }; // Case-insensitive partial match
        }
        if (year) {
            query.year = parseInt(year, 10);
        }
        
        const filteredBooks = await Book.find(query);
        res.json(filteredBooks);
    } catch (error) {
        console.error('Error filtering books:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get statistics about the book collection
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Book collection statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBooks:
 *                   type: integer
 *                   description: Total number of books in the collection
 *                 oldestBook:
 *                   type: integer
 *                   description: Year of the oldest book
 *                 newestBook:
 *                   type: integer
 *                   description: Year of the newest book
 */
// Route to get stats
app.get('/stats', authenticateToken, checkPermission('BOOKS', 'READ'), async (req, res) => {
    try {
        const totalBooks = await Book.countDocuments();
        
        if (totalBooks === 0) {
            return res.json({
                totalBooks: 0,
                oldestBook: null,
                newestBook: null,
                message: 'No books in collection'
            });
        }
        
        // Sử dụng aggregation để tính toán stats
        const stats = await Book.aggregate([
            {
                $group: {
                    _id: null,
                    totalBooks: { $sum: 1 },
                    oldestBook: { $min: '$year' },
                    newestBook: { $max: '$year' }
                }
            }
        ]);
        
        res.json({
            totalBooks: stats[0].totalBooks,
            oldestBook: stats[0].oldestBook,
            newestBook: stats[0].newestBook
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// ================================
// ROLE MANAGEMENT ROUTES
// ================================

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */
app.get('/roles', authenticateToken, checkPermission('ROLES', 'READ'), async (req, res) => {
    try {
        const roles = await Role.find()
            .populate('permissions')
            .sort({ name: 1 });

        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       '201':
 *         description: Role created successfully
 */
app.post('/roles', authenticateToken, checkPermission('ROLES', 'CREATE'), async (req, res) => {
    try {
        const { name, description, permissionIds } = req.body;

        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required' });
        }

        // Kiểm tra role đã tồn tại
        const existingRole = await Role.findOne({ name: name.toUpperCase() });
        if (existingRole) {
            return res.status(400).json({ message: 'Role with this name already exists' });
        }

        // Validate permissions nếu có
        let validPermissions = [];
        if (permissionIds && permissionIds.length > 0) {
            validPermissions = await Permission.find({ _id: { $in: permissionIds }, isActive: true });
            if (validPermissions.length !== permissionIds.length) {
                return res.status(400).json({ message: 'Some permissions are invalid or inactive' });
            }
        }

        const newRole = new Role({
            name: name.toUpperCase(),
            description,
            permissions: validPermissions.map(perm => perm._id),
            isSystem: false
        });

        const savedRole = await newRole.save();
        await savedRole.populate('permissions');

        res.status(201).json({
            message: 'Role created successfully',
            role: savedRole
        });
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       '200':
 *         description: Role updated successfully
 */
app.put('/roles/:id', authenticateToken, checkPermission('ROLES', 'UPDATE'), async (req, res) => {
    try {
        const { description, permissionIds } = req.body;

        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Validate permissions nếu có
        if (permissionIds) {
            const validPermissions = await Permission.find({ _id: { $in: permissionIds }, isActive: true });
            if (validPermissions.length !== permissionIds.length) {
                return res.status(400).json({ message: 'Some permissions are invalid or inactive' });
            }
            role.permissions = validPermissions.map(perm => perm._id);
        }

        if (description) {
            role.description = description;
        }

        const updatedRole = await role.save();
        await updatedRole.populate('permissions');

        res.json({
            message: 'Role updated successfully',
            role: updatedRole
        });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Role deleted successfully
 */
app.delete('/roles/:id', authenticateToken, checkPermission('ROLES', 'DELETE'), async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        if (role.isSystem) {
            return res.status(403).json({ message: 'Cannot delete system role' });
        }

        // Kiểm tra xem có user nào đang sử dụng role này không
        const usersWithRole = await User.countDocuments({ roles: role._id });
        if (usersWithRole > 0) {
            return res.status(400).json({ 
                message: `Cannot delete role. ${usersWithRole} user(s) are currently assigned to this role.` 
            });
        }

        await Role.findByIdAndDelete(req.params.id);

        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// ================================
// PERMISSION MANAGEMENT ROUTES
// ================================

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Permission'
 */
app.get('/permissions', authenticateToken, checkPermission('PERMISSIONS', 'READ'), async (req, res) => {
    try {
        const permissions = await Permission.find().sort({ resource: 1, action: 1 });
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user roles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: User updated successfully
 */
app.put('/users/:id', authenticateToken, checkPermission('USERS', 'UPDATE'), async (req, res) => {
    try {
        const { roleIds, isActive } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate roles nếu có
        if (roleIds) {
            const validRoles = await Role.find({ _id: { $in: roleIds }, isActive: true });
            if (validRoles.length !== roleIds.length) {
                return res.status(400).json({ message: 'Some roles are invalid or inactive' });
            }
            user.roles = validRoles.map(role => role._id);
        }

        if (typeof isActive === 'boolean') {
            user.isActive = isActive;
        }

        const updatedUser = await user.save();
        await updatedUser.populate({
            path: 'roles',
            populate: {
                path: 'permissions',
                model: 'Permission'
            }
        });

        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User deleted successfully
 */
app.delete('/users/:id', authenticateToken, checkPermission('USERS', 'DELETE'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deletion of admin user
        if (user.username === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin user' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})