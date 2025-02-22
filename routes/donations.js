const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Donation = require('../models/Donation');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const { sendNotification } = require('../utils/notifications');
const { checkFileType } = require('../utils/fileUpload');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `donation-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images are allowed'));
    }
});

// Create new donation
router.post('/', auth, upload.array('images', 5), async (req, res) => {
    try {
        const donation = new Donation({
            donor: req.user.id,
            type: req.body.type,
            description: req.body.description
        });

        if (req.body.type === 'food') {
            donation.foodDetails = {
                foodType: req.body.foodType,
                quantity: req.body.quantity,
                unit: req.body.unit,
                expiryDate: req.body.expiryDate,
                pickupLocation: req.body.pickupLocation,
                pickupTimeFrom: req.body.pickupTimeFrom,
                pickupTimeTo: req.body.pickupTimeTo,
                images: req.files ? req.files.map(file => file.path) : []
            };
        } else if (req.body.type === 'money') {
            donation.moneyDetails = {
                amount: req.body.amount,
                currency: 'INR'
            };
        }

        await donation.save();

        // Update user's donations array
        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { donations: donation._id } }
        );

        res.status(201).json(donation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all donations (with filters)
router.get('/', async (req, res) => {
    try {
        const { type, status, sort } = req.query;
        let query = {};

        if (type) query.type = type;
        if (status) query.status = status;

        let donations = await Donation.find(query)
            .populate('donor', 'name email')
            .populate('assignedNGO', 'name')
            .sort(sort === 'latest' ? '-createdAt' : 'createdAt');

        res.json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's donations
router.get('/my-donations', auth, async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user.id })
            .populate('assignedNGO', 'name')
            .sort('-createdAt');

        res.json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get donation by ID
router.get('/:id', async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('donor', 'name email')
            .populate('assignedNGO', 'name');

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        res.json(donation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update donation status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        donation.status = req.body.status;
        if (req.body.impact) {
            donation.impact = req.body.impact;
        }

        await donation.save();
        res.json(donation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 