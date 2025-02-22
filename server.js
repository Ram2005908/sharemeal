const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const ngoRoutes = require('./routes/ngos');
const userRoutes = require('./routes/users');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serve static files

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB Connected Successfully');
    console.log('Connection string:', process.env.MONGODB_URI);
})
.catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});

// Add this to handle MongoDB connection errors
mongoose.connection.on('error', err => {
    console.error('MongoDB runtime error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/ngos', ngoRoutes);

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', err);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });
});
