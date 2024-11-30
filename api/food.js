const express = require('express');
const jwt = require('jsonwebtoken');
const FoodItem = require('./models/FoodItem');
const User = require('./models/User');
const router = express.Router();

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({message: 'Not authorized, invalid token', error: error.message});
        }
    } else {
        return res.status(401).json({message: 'Not authorized, no token provided'});
    }
};

const foodRoutes = (io) => {
    // Create a new food donation
    router.post('/', protect, async (req, res) => {
        const {foodItem, description, quantity, vegStatus, packed, shelfLife} = req.body;

        if (!foodItem || !quantity || !shelfLife) {
            return res.status(400).json({message: 'Food item, quantity, and shelf life are required.'});
        }

        try {
            const newFoodItem = await FoodItem.create({
                foodItem,
                description,
                quantity,
                vegStatus,
                packed,
                shelfLife,
                donor: req.user._id,
                location: req.user.location,
                coordinates: req.user.coordinates,
            });

            io.emit('foodItemAdded', newFoodItem);
            res.status(201).json(newFoodItem);
        } catch (error) {
            res.status(500).json({message: 'Food item creation failed', error: error.message});
        }
    });

    // Get all donations for the logged-in donor
    router.get('/', protect, async (req, res) => {
        try {
            const foodItems = await FoodItem.find({donor: req.user._id}).populate('claimedBy', 'username organizationName');
            res.status(200).json(foodItems);
        } catch (error) {
            res.status(500).json({message: 'Error fetching food items', error: error.message});
        }
    });

    // Update the status of a food donation
    router.put('/:id', protect, async (req, res) => {
        const {id} = req.params;
        const {status} = req.body;

        if (!status) {
            return res.status(400).json({message: 'Status is required to update a food item.'});
        }

        try {
            const updatedFoodItem = await FoodItem.findByIdAndUpdate(id, {status}, {new: true});

            if (!updatedFoodItem) {
                return res.status(404).json({message: 'Food item not found'});
            }

            io.emit('foodItemUpdated', updatedFoodItem);
            res.status(200).json(updatedFoodItem);
        } catch (error) {
            res.status(500).json({message: 'Error updating food item', error: error.message});
        }
    });

    // Delete a food donation
    router.delete('/:id', protect, async (req, res) => {
        const {id} = req.params;

        try {
            const foodItem = await FoodItem.findById(id);
            if (!foodItem) {
                return res.status(404).json({message: 'Food item not found'});
            }

            if (foodItem.donor.toString() !== req.user._id.toString()) {
                return res.status(403).json({message: 'Not authorized to delete this food item'});
            }

            await foodItem.remove();
            io.emit('foodItemDeleted', {foodItemId: id});
            res.status(200).json({message: 'Food item deleted successfully'});
        } catch (error) {
            res.status(500).json({message: 'Error deleting food item', error: error.message});
        }
    });

    // Get all available food donations
    router.get('/available', protect, async (req, res) => {
        try {
            const foodItems = await FoodItem.find({status: 'Available'}).populate('donor', 'username organizationName location');
            res.status(200).json(foodItems);
        } catch (error) {
            res.status(500).json({message: 'Error fetching available food items', error: error.message});
        }
    });

    // Claim a food donation
    router.post('/claim/:id', protect, async (req, res) => {
        const {id} = req.params;

        try {
            const foodItem = await FoodItem.findById(id);
            if (!foodItem) {
                return res.status(404).json({message: 'Food item not found'});
            }

            if (foodItem.status !== 'Available') {
                return res.status(400).json({message: 'Food item is not available'});
            }

            foodItem.status = 'Claimed';
            foodItem.claimedBy = req.user._id;
            await foodItem.save();

            io.emit('foodItemClaimedUpdate', {foodItemId: foodItem._id});
            res.status(200).json({message: 'Food item claimed successfully', foodItem});
        } catch (error) {
            res.status(500).json({message: 'Error claiming food item', error: error.message});
        }
    });

    // Get all claimed food donations for the logged-in client
    router.get('/claimed', protect, async (req, res) => {
        try {
            const claimedItems = await FoodItem.find({
                status: 'Claimed',
                claimedBy: req.user._id,
            }).populate('donor', 'username organizationName location');
            res.status(200).json(claimedItems);
        } catch (error) {
            res.status(500).json({message: 'Error fetching claimed food items', error: error.message});
        }
    });

    return router;
};

module.exports = foodRoutes;
