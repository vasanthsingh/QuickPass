// routes/studentRoutes.js
const express = require('express');
const router = express.Router();


// @route   POST /api/students/add
// @desc    Register a new student
router.post('/add', async (req, res) => {
    try {
        const { rollNumber } = req.body;

        // 1. Check if student exists
        let student = await Student.findOne({ rollNumber });
        if (student) {
            return res.status(400).json({ message: 'Student with this Roll Number already exists' });
        }

        // 2. Create new student
        student = new Student(req.body);
        await student.save();

        res.status(201).json({ message: 'Student created successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;