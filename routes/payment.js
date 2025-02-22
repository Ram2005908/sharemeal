const express = require('express');
const router = express.Router();
const razorpay = require('../utils/razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const ReceiptGenerator = require('../utils/receipt');
const path = require('path');
const NotificationService = require('../utils/notifications');
const User = require('../models/User');

// Create order
router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.userId })
            .sort('-createdAt')
            .populate('donationId');

        res.json(payments);
    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({ message: 'Failed to fetch payment history' });
    }
});

async function handleSuccessfulPayment(paymentIntent) {
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
    if (!payment) return;

    payment.status = 'completed';
    payment.receipt.number = `RCP${Date.now()}`;

    // Generate receipt
    const receiptUrl = await ReceiptGenerator.generateReceipt(payment);
    payment.receipt.url = receiptUrl;

    await payment.save();

    // Get user for notifications
    const user = await User.findById(payment.userId);

    // Send notifications
    await NotificationService.sendPaymentNotification(payment, user);

    // Send email with receipt
    await sendPaymentConfirmation(payment);
}

// Add download receipt endpoint
router.get('/receipt/:paymentId', auth, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment || payment.userId.toString() !== req.user.userId) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        const filePath = path.join(__dirname, '..', payment.receipt.url);
        res.download(filePath);
    } catch (error) {
        console.error('Receipt download error:', error);
        res.status(500).json({ message: 'Failed to download receipt' });
    }
});

module.exports = router; 