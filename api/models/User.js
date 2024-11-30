// User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}, // Password should be hashed
    organizationName: {type: String},
    location: {type: String, required: true},
    coordinates: {
        latitude: { type: Number,required: true },
        longitude: { type: Number,required: true }
    },
    phone: {type: String},
    role: {type: String, enum: ['donor', 'client'], required: true},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', userSchema);
