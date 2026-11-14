const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();
app.use(express.json());

// Sample data
let students = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    program: "Computer Science"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    program: "Business Administration"
  }
];

// Helper to generate a unique ID
function getNextId() {
  return students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
}

// a) GET /students: Retrieve a list of all students. 
app.get('/students', (req, res) => {
  res.json(students);
});

// b) GET /students/:id: Retrieve a specific student by its ID.
app.get('/students/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

// c) POST /students: Add a new student.
app.post(
  '/students',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('program').trim().notEmpty().withMessage('Program is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Check for duplicate email
    if (students.some(s => s.email === req.body.email)) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newStudent = {
      id: getNextId(),
      name: req.body.name,
      email: req.body.email,
      program: req.body.program
    };
    students.push(newStudent);
    res.status(201).json(newStudent);
  }
);

// d) PUT /students/:id: Update an existing student. 
app.put(
  '/students/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('program').optional().trim().notEmpty().withMessage('Program cannot be empty')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const student = students.find(s => s.id === parseInt(req.params.id));
    if (!student) return res.status(404).json({ error: "Student not found" });

    // If email is being updated, check for duplicate email
    if (req.body.email && students.some(s => s.email === req.body.email && s.id !== student.id)) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (req.body.name) student.name = req.body.name;
    if (req.body.email) student.email = req.body.email;
    if (req.body.program) student.program = req.body.program;

    res.json(student);
  }
);

// e) DELETE /students/:id: Delete a student record. 
app.delete('/students/:id', (req, res) => {
  const index = students.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Student not found" });

  students.splice(index, 1);
  res.status(204).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

