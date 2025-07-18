var express = require('express')
const logger = require('./middlewares/logger');
const contentTypeCheck = require('./middlewares/contentTypeCheck');

const app = express()
const port = 3000

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
    apis: ['./baitap1.js']
}
const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))


//Tạo 1 mảng book
const books = [
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
]

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
app.get('/books', (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit, 10);
    res.json(books.slice(startIndex, endIndex));
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
app.get('/books/:isbn', (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn)
    if (book) {
        res.json(book)
    } else {
        res.status(404).json({ message: 'Book not found' })
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
app.post('/books', (req, res) => {
    const { isbn, title, author, year, category } = req.body
    if (!isbn || !title || !author || !year || !category) {
        return res.status(400).json({ message: 'Missing required fields' })
    }
    if (books.find(b => b.isbn === isbn)) {
        return res.status(400).json({ message: 'Book with this ISBN already exists' })
    }
    const newBook = { isbn, title, author, year, category, createdAt: new Date().toISOString() }
    books.push(newBook)
    res.status(201).json({ message: 'Book added', book: newBook })
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
app.put('/books/:isbn', (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn)
    if (!book) {
        return res.status(404).json({ message: 'Book not found' })
    }
    const { title, author, year, category } = req.body
    if (title) book.title = title
    if (author) book.author = author
    if (year) book.year = year
    if (category) book.category = category
    book.updatedAt = new Date().toISOString()
    res.json({ message: 'Book updated', book })
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
app.delete('/books/:isbn', (req, res) => {
    const index = books.findIndex(b => b.isbn === req.params.isbn)
    if (index === -1) {
        return res.status(404).json({ message: 'Book not found' })
    }
    books.splice(index, 1)
    res.json({ message: 'Book deleted' })
})


// Route to get all books with pagination
app.get('/books', (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit, 10);
    res.json(books.slice(startIndex, endIndex));
});

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
app.get('/books/search', (req, res) => {
    const category = req.query.category?.toLowerCase();
    if (!category) {
        return res.status(400).json({ message: 'Category query parameter is required' });
    }
    const filteredBooks = books.filter(book => book.category.toLowerCase() === category);
    res.json(filteredBooks);
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
app.get('/books/sort', (req, res) => {
    const { by, order } = req.query;
    if (!['title', 'year'].includes(by) || !['asc', 'desc'].includes(order)) {
        return res.status(400).json({ message: 'Invalid sort parameters' });
    }
    const sortedBooks = [...books].sort((a, b) => {
        if (order === 'asc') {
            return a[by] > b[by] ? 1 : -1;
        } else {
            return a[by] < b[by] ? 1 : -1;
        }
    });
    res.json(sortedBooks);
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
app.get('/books/filter', (req, res) => {
    const { author, year } = req.query;
    const filteredBooks = books.filter(book => {
        const matchesAuthor = author ? book.author.toLowerCase().includes(author.toLowerCase()) : true;
        const matchesYear = year ? book.year === parseInt(year, 10) : true;
        return matchesAuthor && matchesYear;
    });
    res.json(filteredBooks);
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
app.get('/stats', (req, res) => {
    const totalBooks = books.length;
    const oldestBook = Math.min(...books.map(book => book.year));
    const newestBook = Math.max(...books.map(book => book.year));
    res.json({ totalBooks, oldestBook, newestBook });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})