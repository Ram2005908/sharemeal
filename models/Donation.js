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
    status: {
        type: String,
        enum: ['pending', 'accepted', 'completed', 'cancelled'],
        default: 'pending'
    },
    // For food donations
    foodDetails: {
        foodType: String,
        quantity: Number,
        unit: String,
        expiryDate: Date,
        images: [String],
        pickupLocation: String,
        pickupTimeFrom: Date,
        pickupTimeTo: Date
    },
    // For money donations
    moneyDetails: {
        amount: Number,
        currency: {
            type: String,
            default: 'INR'
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        transactionId: String
    },
    assignedNGO: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description: String,
    impact: {
        peopleHelped: Number,
        mealsProvided: Number
    }
}, {
    timestamps: true
});

// Index for geospatial queries
donationSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Donation', donationSchema); 