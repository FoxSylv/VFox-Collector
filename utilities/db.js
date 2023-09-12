const mongoose = require('mongoose');
const { dbURI } = require('../config.json');
const { User } = require('../data/dbSchema.js');


async function dbInit() {
    try {
        await mongoose.connect(dbURI);
    }
    catch (error) {
        console.log(error);
    }
}


async function newUser(userId) {
    return new User({
        _id: userId
    });
}
async function getProfile(userId) {
    return (await User.findById(userId)) ?? (await newUser(userId));
}

module.exports = {
    getProfile,
    dbInit
};
