// FoodItem.js
const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    foodItem: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Available', 'Claimed', 'Delivered'], default: 'Available' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FoodItem', foodItemSchema);