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
    w: {type: Number, min: 0, alias: "watcherCount"},
    m: {type: Number, min: 0, alias: "minionCount"},
    e: {type: Number, min: 0, alias: "eyesightCount"},
    h: {type: Number, min: 0, alias: "hasteCount"},
    l: {type: Number, min: 0, alias: "luckCount"},
    j: {type: Number, min: 0, alias: "journalCount"},
    c: {type: Number, min: 0, alias: "curiosityCount"},
}, {_id: false});


const Upgrades = mongoose.Schema({
    s: {type: ShrineUpgrades, alias: "shrine"},
    c: {type: CoinUpgrades, alias: "coin"}
}, {_id: false});

const Foxes = new mongoose.Schema({
    o: {type: Number, min: 0, alias: "orange"},
    g: {type: Number, min: 0, alias: "grey"},
    c: {type: Number, min: 0, alias: "cryptid"},
    k: {type: Number, min: 0, alias: "kitsune"}
}, {_id: false});

const Stats = new mongoose.Schema({
    f: {type: Foxes, alias: "foxesFound"},
    o: {type: Foxes, alias: "foxesSold"},
    n: {type: Number, min: 0, alias: "numSearches"},
    s: {type: Number, min: 0, alias: "shrinePurchases"},
    p: {type: Number, min: 0, alias: "shopPurchases"},
    i: {type: Number, min: 0, alias: "itemsFound"},
    u: {type: Number, min: 0, alias: "itemsUsed"},
    b: {type: Number, min: 0, alias: "baitConsumed"},
    c: {type: Number, min: 0, alias: "baitConserved"},
    t: {type: Number, min: 0, alias: "dryStreak"}
}, {_id: false});

const Equips = new mongoose.Schema({
    n: {type: String, alias: "nets"},
    p: {type: String, alias: "pens"},
    l: {type: String, alias: "land"},
    b: {type: String, alias: "bait"},
    e: {type: [String], alias: "activeEffects"}
}, {_id: false});

const Tutorials = new mongoose.Schema({
    s: {type: Boolean, alias: "start"},
    h: {type: Boolean, alias: "hourglass"},
    i: {type: Boolean, alias: "items"},
    b: {type: Boolean, alias: "bait"},
    n: {type: Boolean, alias: "shrine"},
    c: {type: Boolean, alias: "coins"},
    r: {type: Boolean, alias: "rarefox"}
}, {_id: false});

const User = mongoose.model("User", new mongoose.Schema({
    _id: String,
    f: {type: Foxes, alias: "foxes"},
    n: {type: Number, min: 0, alias: "counter"},
    c: {type: Number, min: 0, alias: "coins"},
    l: {type: Number, min: 0, alias: "cooldown"},
    s: {type: Stats, alias: "stats"},
    u: {type: Upgrades, alias: "upgrades"},
    i: {type: [String], alias: "items"},
    e: {type: Equips, alias: "equips"},
    o: {type: Number, min: 0, max: 0xFFFFFF, alias: "color"},
    t: {type: Tutorials, alias: "tutorials"},
}));


module.exports = {User};
