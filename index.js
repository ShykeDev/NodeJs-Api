// Load environment variables
require('dotenv').config();

var express = require('express')
const logger = require('./middlewares/logger');
const contentTypeCheck = require('./middlewares/contentTypeCheck');
const connectDB = require('./config/database');
const Book = require('./models/Book');

// Kết nối MongoDB
connectDB();

const app = express()
const port = process.env.PORT || 3000

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
        ],
        components: {
            schemas: {
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

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
seedData();

//swagger
/**
 * @swagger
 * /books:
 *   get:
 *     summary: Retrieve a list of books with pagination
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
app.get('/books', async (req, res) => {
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
app.get('/books/:isbn', async (req, res) => {
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
app.post('/books', async (req, res) => {
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
app.put('/books/:isbn', async (req, res) => {
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
app.delete('/books/:isbn', async (req, res) => {
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
app.get('/books/search', async (req, res) => {
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
app.get('/books/sort', async (req, res) => {
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
app.get('/books/filter', async (req, res) => {
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
app.get('/stats', async (req, res) => {
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


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})