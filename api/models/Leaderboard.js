const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true, default: 0 },
    rank: { type: Number, required: true }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);