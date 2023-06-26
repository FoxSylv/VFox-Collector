const mongoose = require('mongoose');


const CoinUpgrades = mongoose.Schema({
    p: {type: [Boolean], alias: "pens"}
}, {_id: false});

const ShrineUpgrades = mongoose.Schema({
    b: {type: Number, min: 0, alias: "blessingCount"},
    m: {type: Number, min: 0, alias: "minionCount"},
    w: {type: Number, min: 0, alias: "watcherCount"}
}, {_id: false});

const Upgrades = mongoose.Schema({
    s: {type: ShrineUpgrades, alias: "shrine"},
    c: {type: CoinUpgrades, alias: "coin"}
}, {_id: false});

const Stats = new mongoose.Schema({
    f: {type: Number, min: 0, alias: "foxesFound"},
    n: {type: Number, min: 0, alias: "numSearches"},
    s: {type: Number, min: 0, alias: "shrinePurchases"},
    o: {type: Number, min: 0, alias: "foxesSold"}
}, {_id: false});

const User = mongoose.model("User", new mongoose.Schema({
    _id: String,
    f: {type: Number, min: 0, alias: "foxes"}, 
    c: {type: Number, min: 0, alias: "coins"},
    l: {type: Number, min: 0, alias: "cooldown"},
    s: {type: Stats, alias: "stats"},
    u: {type: Upgrades, alias: "upgrades"}
}));


module.exports = {User};
