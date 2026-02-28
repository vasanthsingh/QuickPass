// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const {
    createStudent,
    studentLogin,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
} = require('../controller/studentController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// POST /api/students/login - Student login (Public)
router.post('/login', studentLogin);

// POST /api/students/add - Create student (Admin only)
router.post('/add', verifyToken, isAdmin, createStudent);

// GET /api/students - Get all students (Admin only)
router.get('/', verifyToken, isAdmin, getAllStudents);

// GET /api/students/:id - Get student by ID (Admin only)
router.get('/:id', verifyToken, isAdmin, getStudentById);

// PUT /api/students/:id - Update student (Admin only)
router.put('/:id', verifyToken, isAdmin, updateStudent);

// DELETE /api/students/:id - Delete student (Admin only)
router.delete('/:id', verifyToken, isAdmin, deleteStudent);

module.exports = router;