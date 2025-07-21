# Books API with MongoDB

REST API để quản lý sách với MongoDB, được xây dựng bằng Node.js, Express.js và Mongoose.

## 🚀 Tính năng

- ✅ CRUD operations cho sách (Create, Read, Update, Delete)
- ✅ Phân trang (Pagination) 
- ✅ Tìm kiếm theo danh mục
- ✅ Sắp xếp theo tiêu đề hoặc năm xuất bản
- ✅ Lọc theo tác giả và/hoặc năm
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