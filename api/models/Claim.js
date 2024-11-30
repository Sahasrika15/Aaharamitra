// Claim.js
const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Claim', claimSchema);