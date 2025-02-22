const express = require('express');
const router = express.Router();
const NGO = require('../models/NGO');
const auth = require('../middleware/auth');

// Get all NGOs
router.get('/', async (req, res) => {
    try {
        const ngos = await NGO.find({ verificationStatus: 'verified' });
        res.json(ngos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get NGO by ID
router.get('/:id', async (req, res) => {
    try {
        const ngo = await NGO.findById(req.params.id);
        if (!ngo) {
            return res.status(404).json({ message: 'NGO not found' });
        }
        res.json(ngo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search NGOs by location
router.get('/search/location', async (req, res) => {
    try {
        const { lat, lng, radius = 10000 } = req.query; // radius in meters

        const ngos = await NGO.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radius
                }
            },
            verificationStatus: 'verified'
        });

        res.json(ngos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 