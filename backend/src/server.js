// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5175;

mongoose.set('bufferCommands', false);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/warden', require('./routes/wardenRoutes'));
app.use('/api/security', require('./routes/securityRoutes'));
app.use('/api/passes', require('./routes/passRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));


// Health Check
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running' });
});

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 20000
        });
        console.log('Connected to MongoDB');

        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    } catch (err) {
        console.error('Database Connection Error:', err.message || err);
        process.exit(1);
    }
};

startServer();

module.exports = app;