const mongoose = require('mongoose');

const Upgrades = mongoose.Schema({
    blessingCount: {type: Number, min: 0}, 
    minionCount: {type: Number, min: 0}, 
    watcherCount: {type: Number, min: 0}
});
const Stats = new mongoose.Schema({
    foxesFound: {type: Number, min: 0}, 
    numSearches: {type: Number, min: 0}
});
const User = mongoose.model("User", new mongoose.Schema({
    _id: String,
    foxes: {type: Number, min: 0}, 
    cooldown: {type: Number, min: 0}, 
    stats: {type: Stats},
    upgrades: {type: Upgrades}
}));


module.exports = {User};
