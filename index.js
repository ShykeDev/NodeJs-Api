var express = require('express')
var mongoose = require('mongoose')

const app = express()
const port = 3000

app.use(express.json()) // Middleware to parse JSON bodies

// Define the schema for the "students" collection
const studentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    grade: String
})

// Register the schema as a model
const Student = mongoose.model('students', studentSchema)

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/studentdb')


/**
 * @swagger
 * /students:
 *   get:
 *     summary: Retrieve a list of students
 *     responses:
 *       200:
 *         description: A list of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   age:
 *                     type: number
 *                   grade:
 *                     type: string
 */
app.get('/students', async (req, res) => {
    try {
        // Get all students
        const students = await Student.find({})
        res.json(students)
    } catch (err) {
        res.status(500).send('Error retrieving students')
    }
})

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Retrieve a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     responses:
 *       200:
 *         description: A single student
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 age:
 *                   type: number
 *                 grade:
 *                   type: string
 *       404:
 *         description: Student not found
 */
app.get('/students/:id', async (req, res) => {
    try {
        // Get a student by ID
        const student = await Student.findById(req.params.id)
        if (!student) {
            return res.status(404).send('Student not found')
        }
        res.json(student)
    } catch (err) {
        res.status(500).send('Error retrieving student')
    }
})

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               grade:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created successfully
 */
app.post('/students', async (req, res) => {
    try {
        // Create a new student
        const newStudent = new Student(req.body)
        await newStudent.save()
        res.status(201).json(newStudent)
    } catch (err) {
        res.status(400).send('Error creating student')
    }
})

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               grade:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       404:
 *         description: Student not found
 */
app.put('/students/:id', async (req, res) => {
    try {
        // Update a student by ID
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!updatedStudent) {
            return res.status(404).send('Student not found')
        }
        res.json(updatedStudent)
    } catch (err) {
        res.status(400).send('Error updating student')
    }
})

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       404:
 *         description: Student not found
 */
app.delete('/students/:id', async (req, res) => {
    try {
        // Delete a student by ID
        const deletedStudent = await Student.findByIdAndDelete(req.params.id)
        if (!deletedStudent) {
            return res.status(404).send('Student not found')
        }
        res.json({ message: 'Student deleted successfully' })
    }
    catch (err) {
        res.status(500).send('Error deleting student')
    }
})

//thêm swagger
const swaggerUi = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Student API',
            version: '1.0.0',
            description: 'API for managing students'
        },
        servers: [
            {
                url: 'http://localhost:3000'
            }
        ]
    },
    apis: ['./index.js']
}
const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`)
})