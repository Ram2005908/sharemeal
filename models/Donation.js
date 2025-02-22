const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['food', 'money'],
        required: true
    },
    // For food donations
    foodType: String,
    quantity: Number,
    unit: String,
    expiryDate: Date,
    pickupLocation: String,
    pickupTimeFrom: Date,
    pickupTimeTo: Date,
    images: [String],
    
    // For money donations
    amount: Number,
    paymentMethod: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for geospatial queries
donationSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Donation', donationSchema); 