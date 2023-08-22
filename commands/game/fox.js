const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { foxData } = require('../../data/foxData.js');
const { items } = require('../../utilities/items.js');
const { countFoxes } = require('../../utilities/countFoxes.js');
const { msToSec } = require('../../utilities/msToSec.js');
const { getColor } = require('../../utilities/getColor.js');


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

function canItems(user) {
    return user.upgrades?.coin?.nets?.shoddy === true;
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

function findFoxes(user, foxCount, isMinion, iterations, tailCount) {
    const chance = getFoxChance(user, foxCount, isMinion, tailCount);
    const fquantityBonus = getFoxQuantity(user, foxCount, isMinion, tailCount);
    const fqualityBonus = getFoxQuality(user, foxCount, isMinion, tailCount);
    const kitsuneBonus = getKitsuneBonus(user, foxCount, isMinion, tailCount);

    let foxes = new Map();
    for (let i = 0; i < iterations; ++i) {
        if (Math.random() < chance) {
            const quantity = 1 + Math.max(0, 0.7 + Math.random() * fquantityBonus);
            const quality = 1.6 + Math.max(0, Math.random() * fqualityBonus);

            let type = "orange";
            if (canRareFox(user)) {
                if ((quality * kitsuneBonus) > 9 && canKitsune(user)) {
                    type = "kitsune";
                }
                else {
                    type = foxData.findLast(f => quality > f.weight)?.value ?? "orange";
                }
            }
            const typeData = foxData.find(f => f.value === type);
            const newFoxes = Math.max(1, Math.floor(quantity / Math.sqrt(typeData.weight)));
            foxes.set(type, (foxes.get(type) ?? 0) + newFoxes);
        }
    }

    user.foxes ??= {};
    for (const [type, num] of foxes) {
        user.foxes[type] = (user.foxes[type] ?? 0) + num;
    }

    return foxes;
}


function foxMessage(user, foxes, baitEnded, item) {
    /* Fox Tally */
    let description = foxData.reduce((acc, type) => {
        const num = foxes.get(type.value);
        if (num) {
            return acc.concat(`**${num}** ${type.emoji}\n`);
        }
        return acc;
    }, "");
    let foundFoxes = true;
    if (description === "") {
        description = "You found no foxes :(\n";
        foundFoxes = false;
    }

    /* Overpopulation */
    const foxCount = countFoxes(user.foxes);
    const capacity = getPenCapacity(user);
    if (capacity < foxCount) {
        description = description.concat(`\nYour pen is overcrowded! (**${foxCount}/${capacity}**)\nYou have gained ${msToSec(getCooldown(user, foxCount) - getCooldown(user, capacity))} extra cooldown!\n`);
    }

    /* Bait */
    if (baitEnded !== "none") {
        description = description.concat(`\nYou ran out of ${baitEnded}!\n`);
    }
    else if (user.equips?.bait) {
        description = description.concat(`\n***${user.upgrades.coin.bait[user.equips.bait]}** ${shopData.find(c => c.value === "bait").upgrades.find(p => p.value === user.equips.bait).name} left!*\n`);
    }

    /* Item */
    if (item) {
        [slot, itemVal] = item.split('.');
        const newItem = items[itemVal];
        description = description.concat(`\nYou found a ${newItem.emoji} **${newItem.name}**!\n${slot >= 9 ? `Unfortunately, your item inventory was full :(` : `It has gone into slot **${parseInt(slot) + 1}**!`}\n`);
        //Clear active effects
        user.equips ??= {};
        let userEffects = user.equips.activeEffects ?? [];
        user.equips.activeEffects = userEffects.filter(effect => !effectsRemovedOnItem.includes(effect));
        const numCleared = userEffects.length - user.equips.activeEffects.length;
        if (numCleared > 0) {
            description = description.concat(`Since you found an item, **${numCleared} active effect${numCleared === 1 ? "** has" : "s** have"} been cleared\n`);
        }
    }


    const net = shopData.find(c => c.value === "nets").upgrades.find(u => u.value === user.equips?.nets);
    const embed = new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle(user.equips?.nets ? `${net.name} -` : "You found:")
        .setDescription(description)
        .setFooter({text: `You ${foundFoxes ? "now ": ""}have ${foxCount} ${foxCount === 1 ? "fox" : "foxes"}! ${(foxCount === 69 || foxCount === 420) ? "Nice!" : ""}`});
    return {embeds: [embed]};
}


function getPenCapacity(user) {
    return getAllBonuses(user, "max") + ((user.upgrades?.shrine?.watcherCount ?? 0) * 20);
}
function getCooldown(user, foxCount) {
    const baseCooldown = getAllBonuses(user, "cooldown");
    const penalty = getAllBonuses(user, "penalty");
    const max = getPenCapacity(user);

    return (baseCooldown + penalty * Math.max(0, foxCount - max)) / invSum(1, 1 + (user?.upgrades?.shrine?.hasteCount ?? 0));
}

const effectsRemovedOnItem = [
    "glass",
    "sslag",
    "chain",
    "ball",
    "micro",
    "prec",
    "idea",
    "greed",
    "faith"
];


module.exports = {
	data: new SlashCommandBuilder()
		.setName("fox")
		.setDescription("Go searching for foxes!"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const cooldown = user.cooldown;
        const now = Date.now();
        if (now < cooldown) {
            await interaction.reply(`You are still on cooldown for \`${msToSec(cooldown - now)}\``);
            return;
        }

        /* Calculate foxes earned */
        const foxCount = countFoxes(user.foxes);
        const minionCount = user.upgrades?.shrine?.minionCount ?? 0;
        const tailCount = (user.items ?? []).filter(i => i === "tail").length;
        const userFoxes = findFoxes(user, foxCount, false, 1, tailCount);
        const minionFoxes = findFoxes(user, foxCount, true, minionCount, tailCount);
        let totalFoxes = new Map();
        for (const [type, num] of userFoxes) totalFoxes.set(type, num);
        for (const [type, num] of minionFoxes) totalFoxes.set(type, (totalFoxes.get(type) ?? 0) + num);

        /* Use bait */
        const baitRate = (1 - Math.tanh((user.upgrades?.shrine?.journalCount ?? 0) / 25)) * (totalFoxes.size === 0 ? 0.9 : 1);
        let baitEnded = "none";
        if (Math.random() < baitRate) {
            const baitVal = user.equips?.bait;
            if (baitVal) {
                const newBait = user.upgrades.coin.bait[baitVal] - 1;
                if (newBait === 0) {
                    baitEnded = shopData.find(c => c.value === "bait").upgrades.find(p => p.value === user.equips.bait).name;
                    user.equips.bait = undefined;
                }
                user.upgrades.coin.bait[baitVal] = newBait;
            }
        }

        /* Calculate items earned */
        let item = undefined;
        if (canItems(user)) {
            if (getItemChance(user, tailCount) > Math.random()) {
                const iquality = getItemQuality(user, tailCount);
                const filteredItems = Object.keys(items).filter(itemVal => items[itemVal].rarity <= iquality && items[itemVal].rarity + 3 > iquality);
                const newItem = filteredItems[Math.floor(Math.random() * filteredItems.length)];

                const userItems = user.items ?? {};
                let slot = userItems.findIndex(s => !s);
                if (slot === -1) { //if (findIndex fails)
                    slot = userItems.length;
                }
                if (slot < 9) { //Max 9 items
                    user.items ??= {};
                    user.items[slot] = newItem;
                }
                item = `${slot}.${newItem}`;
            }
        }
    
        user.cooldown = now + getCooldown(user, foxCount);
        await interaction.reply(foxMessage(user, totalFoxes, baitEnded, item));

        /* Initial Tutorial */
        if (!user.tutorials?.start) {
            user.tutorials ??= {};
            user.tutorials.start = true;

            await interaction.followUp({content: `Welcome to VFox!\n
In this game, the goal is to collect as many foxes as possible. The twist is that the more foxes you have, the harder they are to find!\n
Luckily, you can forfeit foxes at the \`shrine\` to gain upgrades! Or you can \`sell\` them for coins to use at the \`shop\` for better equipment\n
Either way, the choice is yours! Good luck hunting!`, ephemeral: true});
        }

        /* Item Tutorial */
        if (!user.tutorials?.items && item) {
            user.tutorials ??= {};
            user.tutorials.items = true;

            await interaction.followUp({content: `Congratulations! You just got your first item\n
\`items\` give small boosts to your fox-finding capabilties\n
Some give temporary effects that can last until you next find an item or beyond!\n
(You can view all active effects in your \`equips\` screen)`, ephemeral: true});
        }

        /* Rare Fox Tutorial */
        if (!user.tutorials?.rarefox && totalFoxes.has("grey")) {
            user.tutorials ??= {};
            user.tutorials.rarefox = true;

            await interaction.followUp({content: `Congratulations! You just got your first rare fox\n
When \`sell\`ing, rare foxes are valued higher than normal foxes\n
Rare foxes aren't worth more at the \`shrine\`, however\n
You can view the breakdown of your foxes in your \`pen\``, ephemeral: true});
        }


        await user.save();
	}
};

