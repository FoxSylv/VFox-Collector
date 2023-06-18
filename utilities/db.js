const mongoose = require('mongoose');
const { dbURI } = require('../config.json');

async function dbInit() {
    await mongoose.connect(dbURI);
}


const Upgrades = mongoose.Schema({
    blessingCount: {type: Number, min: 0},
    minionCount: {type: Number, min: 0},
    watcherCount: {type: Number, min: 0}
});
const Stats = new mongoose.Schema({
    foxesFound: {type: Number, min: 0},
    numSearches: {type: Number, min: 0}
});
const User = mongoose.model('User', new mongoose.Schema({
    _id: String,
    foxes: {type: Number, min: 0},
    cooldown: {type: Number, min: 0},
    stats: {type: Stats},
    upgrades: {type: Upgrades}
}));


async function newUser(userId) {
    return new User({
        _id: userId
    });
}
async function getProfile(userId) {
    return (await User.findById(userId)) ?? (await newUser(userId));
}

module.exports = {
    User,
    getProfile,
    dbInit
};
