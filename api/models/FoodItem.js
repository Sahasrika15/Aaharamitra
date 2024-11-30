const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
    foodItem: {type: String, required: true},
    description: {type: String},
    quantity: {type: Number, required: true},
    vegStatus: {type: String, enum: ['Veg', 'Non-Veg'], required: true},
    packed: {type: Boolean, required: true},
    shelfLife: {type: Number, required: true},
    status: {type: String, enum: ['Available', 'Claimed', 'Expired'], default: 'Available'},
    donor: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    claimedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    location: {type: String},
    coordinates: {latitude: Number, longitude: Number},
}, {timestamps: true});

module.exports = mongoose.model('FoodItem', FoodItemSchema);
