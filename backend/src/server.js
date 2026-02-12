// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Database Connection
mongoose.connect('mongodb://localhost:27017/smart-outpass', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Database Connection Error:', err));

// NEW: Import and Use Routes
app.use('/api/students', require('./routes/studentRoutes'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));