// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://rasaputhravasanth_db_user:Quickpass123quickpass.exxfdy9.mongodb.net/?appName=QuickPass')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Database Connection Error:', err));

// Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));