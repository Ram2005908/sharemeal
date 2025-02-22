const Razorpay = require('razorpay');
const dotenv = require('dotenv');
dotenv.config();

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Missing Razorpay credentials - please check your .env file');
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay; 