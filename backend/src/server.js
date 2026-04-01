// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5175;

mongoose.set('bufferCommands', false);


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
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>QuickPass API | Status</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; }
                .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.5); }
             head { display: none; }
            </style>
        </head>
        <body class="min-h-screen flex items-center justify-center p-6">
            <div class="max-w-md w-full glass rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center relative overflow-hidden">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
                
                <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl shadow-lg shadow-indigo-200 mb-8">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                </div>

                <h1 class="text-3xl font-bold text-slate-900 mb-2 tracking-tight">QuickPass API</h1>
                <p class="text-slate-500 font-medium mb-8">Smart Outpass Management System</p>

                <div class="bg-white/50 rounded-2xl p-6 border border-slate-100 mb-8 flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-slate-400 uppercase tracking-widest">System Status</span>
                        <div class="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
                            <span class="relative flex h-2 w-2">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span class="text-xs font-bold text-emerald-600">Online</span>
                        </div>
                    </div>
                    <div class="h-px bg-slate-100 w-full"></div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-slate-500 font-medium">Environment</span>
                        <span class="text-slate-900 font-bold">Production</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-slate-500 font-medium">Uptime</span>
                        <span class="text-slate-900 font-bold">99.9%</span>
                    </div>
                </div>

                <p class="text-xs text-slate-400 font-medium">
                    &copy; 2026 QuickPass Central Server. <br> Unauthorized access is strictly monitored.
                </p>
            </div>
        </body>
        </html>
    `);
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