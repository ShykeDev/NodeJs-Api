# Books API with Dynamic Role-Based Access Control

A comprehensive REST API for managing books with dynamic role-based permission system, built with Node.js, Express, MongoDB, and JWT authentication.

## Features

- **CRUD Operations** for books (Create, Read, Update, Delete)
- **User Management** with authentication and authorization
- **Dynamic Role-Based Access Control** with granular permissions
- **Search, Filter, and Sort** functionality for books
- **Statistics** and analytics
- **JWT Authentication** for secure API access
- **Swagger Documentation** for API exploration
- **MongoDB** for data persistence

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env` file
4. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000`

## Authentication

### Default Admin Account
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Login Process
1. Send POST request to `/auth/login` with email and password
2. Receive JWT token in response
3. Include token in Authorization header: `Bearer <token>`

## Roles and Permissions

### Default Roles

1. **SUPER_ADMIN** - Full system access
2. **ADMIN** - Management access to books and users
3. **MANAGER** - Books and users management
4. **LIBRARIAN** - Books management (Create, Read, Update)
5. **USER** - Read-only access to books

### Permission System

Permissions are based on **Resource** and **Action**:

#### Resources:
- `BOOKS` - Book management
- `USERS` - User management
- `ROLES` - Role management
- `PERMISSIONS` - Permission management

#### Actions:
- `READ` - View resources
- `CREATE` - Create new resources
- `UPDATE` - Modify existing resources
- `DELETE` - Remove resources
- `MANAGE` - Full access (all actions)

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - Register new user (Admin only)
- `GET /auth/profile` - Get current user profile

### Books Management
- `GET /books` - Get books with pagination
- `GET /books/:isbn` - Get book by ISBN
- `POST /books` - Create new book
- `PUT /books/:isbn` - Update book
- `DELETE /books/:isbn` - Delete book
- `GET /books/search?category=` - Search books by category
- `GET /books/sort?by=title&order=asc` - Sort books
- `GET /books/filter?author=&year=` - Filter books
- `GET /stats` - Get collection statistics

### User Management
- `GET /users` - Get all users (Admin only)
- `PUT /users/:id` - Update user roles (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

### Role Management
- `GET /roles` - Get all roles
- `POST /roles` - Create new role
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

### Permissions
- `GET /permissions` - Get all permissions

## API Documentation

Swagger documentation is available at: `http://localhost:3000/api-docs`
- ✅ Thống kê collection sách
- ✅ Swagger API Documentation
- ✅ MongoDB với Mongoose ODM
- ✅ Middleware logging và content-type validation
- ✅ Error handling

## 📋 Yêu cầu

- Node.js (v16 trở lên)
- MongoDB (local hoặc MongoDB Atlas)
- npm hoặc yarn

## 🛠️ Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd NodeJs-Api
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình MongoDB**
- Cài đặt MongoDB local hoặc tạo cluster trên MongoDB Atlas
- Cập nhật `MONGODB_URI` trong file `.env`

4. **Cấu hình environment variables**
```bash
# Tạo file .env hoặc cập nhật các giá trị
MONGODB_URI=mongodb://localhost:27017/booksapi
PORT=3000
NODE_ENV=development
```

5. **Chạy ứng dụng**
```bash
# Development mode với nodemon
npm run dev

# Production mode
npm start
```

## 📚 API Endpoints

### Books Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/books` | Lấy danh sách sách với phân trang |
| GET | `/books/:isbn` | Lấy sách theo ISBN |
| POST | `/books` | Thêm sách mới |
| PUT | `/books/:isbn` | Cập nhật sách |
| DELETE | `/books/:isbn` | Xóa sách |

### Advanced Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/books/search?category=` | Tìm kiếm theo danh mục |
| GET | `/books/sort?by=&order=` | Sắp xếp sách |
| GET | `/books/filter?author=&year=` | Lọc sách |
| GET | `/stats` | Thống kê collection |

### Documentation
- GET `/api-docs` - Swagger API Documentation

## 📝 Ví dụ sử dụng

### 1. Lấy danh sách sách với phân trang
```bash
GET /books?page=1&limit=5
```

### 2. Thêm sách mới
```bash
POST /books
Content-Type: application/json

{
  "isbn": "B005",
  "title": "JavaScript: The Good Parts",
  "author": "Douglas Crockford",
  "year": 2008,
  "category": "Programming"
}
```

### 3. Tìm kiếm sách theo danh mục
```bash
GET /books/search?category=programming
```

### 4. Sắp xếp sách
```bash
GET /books/sort?by=year&order=desc
```

### 5. Lọc sách
```bash
GET /books/filter?author=martin&year=2008
```

## 🗂️ Cấu trúc Project

```
NodeJs-Api/
├── models/
│   └── Book.js              # Mongoose model cho Book
├── config/
│   └── database.js          # Cấu hình kết nối MongoDB
├── middlewares/
│   ├── logger.js           # Middleware logging
│   └── contentTypeCheck.js # Middleware kiểm tra Content-Type
├── index.js                # File chính
├── package.json           # Dependencies
├── .env                   # Environment variables
└── README.md             # Documentation
```

## 🧪 Test API

Bạn có thể test API bằng:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Postman**: Import collection từ Swagger
- **curl**: Sử dụng command line
- **VS Code REST Client**: Tạo file `.http`

## 🔧 MongoDB Schema

```javascript
{
  isbn: String (required, unique),
  title: String (required),
  author: String (required), 
  year: Number (required),
  category: String (required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🛡️ Error Handling

API trả về các HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **swagger-jsdoc**: Swagger documentation generator
- **swagger-ui-express**: Swagger UI middleware
- **dotenv**: Environment variables loader

## 🔄 Development

```bash
# Chạy với nodemon để auto-reload
npm run dev

# Chạy production
npm start
```