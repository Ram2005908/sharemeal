const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Import routes
const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const ngoRoutes = require('./routes/ngos');
const paymentRoutes = require('./routes/payment');

// Load environment variables
dotenv.config();

// Verify Stripe keys are loaded
if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLIC_KEY) {
    console.error('Stripe keys are not properly configured in .env file');
    process.exit(1);
}

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Add this near your other middleware
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/payment', paymentRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("ShareMeal API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });
});
