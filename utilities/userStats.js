const { shopData } = require('../data/shopData.js');



function invSum(start, span) {
    let result = 0;
    for (let i = start; i < (start + span); ++i) {
        result += (1 / i); 
    }   
    return result;
}

function getAllBonuses(user, bonus) {
    return shopData.reduce((acc, category) => {
        return acc + (category.upgrades.find(u => u.value === user.equips?.[category.value])?.[bonus] ?? (category[bonus] ?? 0));
    }, 0);
}
/* Returns the number of times the effect is active, if stackable */
function hasEffect(user, activeEffect) {
    return user.equips?.activeEffects?.filter(e => e === activeEffect).length ?? 0;
}

function canMiss(user) {
    return ((user.stats?.numSearches ?? 0) > 8) && ((user.stats?.dryStreak ?? 0) < (4 + Math.floor((user.stats?.shopPurchases ?? 0) / 2)));
}
function canItems(user) {
    return (user.stats?.numSearches ?? 0) > 20;
}
function canRareFox(user) {
    return user.upgrades?.coin?.nets?.basic === true;
}
function canKitsune(user) {
    return ((user.upgrades?.coin?.nets?.["nine-tailed"] === true) ||
            (user.upgrades?.coin?.pens?.shrine === true) ||
            (user.upgrades?.coin?.land?.blessed === true));
}

function getFoxChance(user, foxCount, isMinion, tailCount) {
    let chance = getAllBonuses(user, "chance");
    chance += 0.3 * (1 - (0.9 ** (user.upgrades?.shrine?.blessingCount ?? 0)));
    chance -= invSum(2, hasEffect(user, "micro")) / 2;
    chance += invSum(2, hasEffect(user, "faith")) / 2;
    chance *= (1 + (tailCount / 10));
    return Math.min(Math.tanh(2.4 + chance) ** (foxCount), 0.9) * (isMinion ? (1 / (Math.sqrt(user.upgrades?.shrine?.minionCount ?? 0) + 1)) : 1);
}
function getFoxQuantity(user, foxCount, isMinion, tailCount) {
    let quantity = getAllBonuses(user, "foxQuantity");
    quantity += invSum(2, hasEffect(user, "chain"));
    quantity -= invSum(2, hasEffect(user, "ball"));
    quantity -= hasEffect(user, "micro");
    quantity += hasEffect(user, "idea");
    quantity *= isMinion ? 0.6 : (1 + (tailCount / 3));
    return quantity;
}
function getFoxQuality(user, foxCount, isMinion, tailCount) {
    let quality = getAllBonuses(user, "foxQuality");
    quality += invSum(3, user.upgrades?.shrine?.luckCount ?? 0);
    quality -= invSum(2, hasEffect(user, "chain"));
    quality += invSum(2, hasEffect(user, "ball"));
    quality -= hasEffect(user, "micro");
    quality += hasEffect(user, "idea");
    quality *= isMinion ? 0.4 : (1 + (tailCount / 3));
    return quality;
}
function getKitsuneBonus(user, foxCount, isMinion, tailCount) {
    if (isMinion) {
        return 0;
    }
    let kbonus = getAllBonuses(user, "kitsune") / 10;
    kbonus += invSum(15, (user.upgrades?.shrine?.curiosityCount ?? 0) + tailCount);
    kbonus -= hasEffect(user, "micro");
    return 1 + kbonus;
}
function getItemChance(user, tailCount) {
    let chance = getAllBonuses(user, "itemQuantity");
    chance += invSum(2, user.upgrades?.shrine?.eyesightCount ?? 0);
    chance += invSum(2, hasEffect(user, "glass"));
    chance -= invSum(2, hasEffect(user, "sslag"));
    chance -= invSum(2, hasEffect(user, "ball"));
    chance -= hasEffect(user, "micro");
    chance += hasEffect(user, "greed");
    chance += tailCount / 2;
    return 0.01 + Math.max(0, 0.08 + (chance / 20));
}
function getItemQuality(user, tailCount) {
    let quality = getAllBonuses(user, "itemQuality");
    quality -= invSum(2, hasEffect(user, "chain"));
    quality += invSum(2, hasEffect(user, "micro"));
    quality += invSum(2, hasEffect(user, "prec"));
    quality += hasEffect(user, "greed");
    quality += tailCount / 3;
    return Math.min(Math.max(-7, quality), 9);
}

function getPenCapacity(user) {
    if (user.equips?.pens === "shrine") {
        let priceSum = shrineData.reduce((acc, upgrade) => {
            return acc + ((1 + (user.upgrades?.shrine?.[upgrade.value] ?? 0)) * upgrade.basePrice);
        }, 0);
        const tailCount = (user.items ?? []).filter(i => i === "tail").length;
        if (tailCount < 9) {
            priceSum += (tailCount + 1) * 1111;
        }
        return priceSum / (shrineData.length + (tailCount < 9 ? 1 : 0));
    }
    return getAllBonuses(user, "max") + ((user.upgrades?.shrine?.watcherCount ?? 0) * 20);
}
function getCooldown(user, foxCount) {
    const baseCooldown = getAllBonuses(user, "cooldown");
    const penalty = getAllBonuses(user, "penalty");
    const max = getPenCapacity(user);

    return Math.max((baseCooldown + penalty * Math.max(0, foxCount - max)) / invSum(1, 1 + (user?.upgrades?.shrine?.hasteCount ?? 0)), 2000);
}

function getBaitUseChance(user, hasFoundFoxes) {
    let baitMod = user.upgrades?.shrine?.journalCount ?? 0;
    baitMod += 3 * invSum(2, hasEffect(user, "cbait"));
    baitMod += 4 * invSum(1, hasEffect(user, "mbait"));
    return (1 - Math.tanh(baitMod / 25)) * (hasFoundFoxes ? 1 : 0.9);
}

module.exports = {
    canMiss,
    canItems,
    canRareFox,
    canKitsune,
    getFoxChance,
    getFoxQuantity,
    getFoxQuality,
    getKitsuneBonus,
    getItemChance,
    getItemQuality,
    getPenCapacity,
    getCooldown,
    getBaitUseChance
}
