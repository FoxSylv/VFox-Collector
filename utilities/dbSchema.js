const mongoose = require('mongoose');

const NetUpgrades = mongoose.Schema({
    s: {type: Boolean, alias: "shoddy"},
    b: {type: Boolean, alias: "basic"},
    e: {type: Boolean, alias: "extendo"},
    t: {type: Boolean, alias: "trawling"},
    g: {type: Boolean, alias: "glitter"},
    n: {type: Boolean, alias: "nine-tailed"}
}, {_id: false});
const PenUpgrades = mongoose.Schema({
    b: {type: Boolean, alias: "basic"},
    c: {type: Boolean, alias: "cramped"},
    p: {type: Boolean, alias: "park"},
    i: {type: Boolean, alias: "pit"},
    a: {type: Boolean, alias: "apartment"},
    s: {type: Boolean, alias: "shrine"}
}, {_id: false});
const LandUpgrades = mongoose.Schema({
    b: {type: Boolean, alias: "basic"},
    w: {type: Boolean, alias: "woods"},
    f: {type: Boolean, alias: "forest"},
    d: {type: Boolean, alias: "dump"},
    c: {type: Boolean, alias: "countryside"},
    l: {type: Boolean, alias: "blessed"}
}, {_id: false});
const BaitUpgrades = mongoose.Schema({
    b: {type: Number, alias: "basic"},
    s: {type: Number, alias: "special"},
    a: {type: Number, alias: "advanced"},
    l: {type: Number, alias: "blessed"}
}, {_id: false});

const CoinUpgrades = mongoose.Schema({
    n: {type: NetUpgrades, alias: "nets"},
    p: {type: PenUpgrades, alias: "pens"},
    l: {type: LandUpgrades, alias: "land"},
    b: {type: BaitUpgrades, alias: "bait"},
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
    u: {type: Upgrades, alias: "upgrades"},
    i: {type: [String], alias: "items"}
}));


module.exports = {User};
