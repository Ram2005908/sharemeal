const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        match: [/^[0-9]{10}$/, 'Please enter a valid phone number']
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    role: {
        type: String,
        enum: ['donor', 'ngo', 'admin'],
        default: 'donor'
    },
    donations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation'
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true 
});

// Add index for email
userSchema.index({ email: 1 });

// Add a method to hide password in responses
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model("User", userSchema); 