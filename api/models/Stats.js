const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    totalFoodSaved: { type: Number, default: 0 },
    totalCarbonEmissionPrevented: { type: Number, default: 0 },
    totalLivesImpacted: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stats', statsSchema);