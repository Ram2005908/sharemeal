const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    categories: [{
        type: String,
        enum: ['food', 'money']
    }],
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    documents: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for geospatial queries
ngoSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('NGO', ngoSchema); 