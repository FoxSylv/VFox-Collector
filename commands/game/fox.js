const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { foxEmoji } = require('../../data/foxEmoji.js');
const { countFoxes } = require('../../utilities/countFoxes.js');
const { msToSec } = require('../../utilities/msToSec.js');


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

function canItems(user) {
    return user.upgrades?.coin?.nets?.shoddy === true;
}
function canRareFox(user) {
    return user.upgrades?.coin?.nets?.basic === true;
}
function canKitsune(user) {
    return ((user.upgrades?.coin?.nets?.nine-tailed === true) ||
            (user.upgrades?.coin?.pens?.shrine === true) ||
            (user.upgrades?.coin?.land?.blessed === true));
}

function getFoxChance(user, foxCount) {
    let chance = getAllBonuses(user, "chance");
    chance += (invSum(9, user.upgrades?.shrine?.blessingCount ?? 0) / 10);
    return Math.tanh(2.4 + chance) ** (foxCount);
}

function findFoxes(user, foxCount, isMinion, iterations) {
    const chance = getFoxChance(user, foxCount, isMinion) * (isMinion ? 0.5 : 1);
    const fquantityBonus = getAllBonuses(user, "foxQuantity") * (isMinion ? 0.6 : 1);
    const fqualityBonus = (getAllBonuses(user, "foxQuality") + invSum(3, user.upgrades?.shrine?.luckCount ?? 0)) * (isMinion ? 0.4 : 1);
    const kitsuneBonus = isMinion ? 0 : (1 + (getAllBonuses(user, "kitsune") / 10) + invSum(15, user.upgrades?.shrine?.curiosityCount ?? 0));

    let foxes = new Map();
    for (let i = 0; i < iterations; ++i) {
        if (Math.random() < chance) {
            const quantity = 1 + Math.floor(Math.random() * fquantityBonus);
            const quality = Math.floor(Math.random() * fqualityBonus);

            if (kitsuneBonus * quality > 9 && canKitsune(user) && canRareFox(user)) {
                foxes.set("kitsune", (foxes.get("kitsune") ?? 0) + quantity);
            }
            else if (quality > 5 && canRareFox(user)) {
                foxes.set("cryptid", (foxes.get("cryptid") ?? 0) + quantity);
            }
            else if (quality > 2 && canRareFox(user)) {
                foxes.set("grey", (foxes.get("grey") ?? 0) + quantity);
            }
            else {
                foxes.set("orange", (foxes.get("orange") ?? 0) + Math.max(1, quantity));
            }
        }
    }

    user.foxes ??= {};
    for (const [type, num] of foxes) {
        user.foxes[type] = (user.foxes[type] ?? 0) + num;
    }

    return foxes;
}


function foxMessage(user, foxes, baitEnded, item) {
    let description = foxEmoji.reduce((acc, type) => {
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

    if (baitEnded !== "none") {
        description = description.concat(`\nYou ran out of ${baitEnded}!\n`);
    }
    else if (user.equips?.bait) {
        description = description.concat(`\n***${user.upgrades.coin.bait[user.equips.bait]}** ${shopData.find(c => c.value === "bait").upgrades.find(p => p.value === user.equips.bait).name} left!*\n`);
    }

    const foxCount = countFoxes(user.foxes);
    const net = shopData.find(c => c.value === "nets").upgrades.find(u => u.value === user.equips?.nets);
    const embed = new EmbedBuilder()
        .setColor(0xEA580C)
        .setTitle(user.equips?.nets ? `${net.name} -` : "You found:")
        .setDescription(description)
        .setFooter({text: `You ${foundFoxes ? "now ": ""}have ${foxCount} ${foxCount === 1 ? "fox" : "foxes"}!`});
    return {embeds: [embed]};
}


function getCooldown(user, foxCount) {
    const baseCooldown = getAllBonuses(user, "cooldown");
    const penalty = getAllBonuses(user, "penalty");
    const max = getAllBonuses(user, "max") + ((user.upgrades?.shrine?.watcherCount ?? 0) * 10);

    return (baseCooldown + penalty * Math.max(0, foxCount - max)) / invSum(1, 1 + (user?.upgrades?.shrine?.hasteCount ?? 0));
}


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
        const userFoxes = findFoxes(user, foxCount, false, 1);
        const minionFoxes = findFoxes(user, foxCount, true, minionCount);
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
            //TODO: ITEMS
        }
    
        user.cooldown = now + getCooldown(user, foxCount);
        await user.save();
        await interaction.reply(foxMessage(user, totalFoxes, baitEnded, item));
	}
};

