const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { foxData } = require('../../data/foxData.js');
const { shrineData } = require('../../data/shrineData.js');
const { tutorialData } = require('../../data/tutorialData.js');
const { items } = require('../../utilities/items.js');
const { countFoxes } = require('../../utilities/countFoxes.js');
const { msToSec } = require('../../utilities/msToSec.js');
const { getColor } = require('../../utilities/getColor.js');
const { canMiss, canItems, canRareFox, canKitsune, getFoxChance, getFoxQuantity, getFoxQuality, getKitsuneBonus, getItemChance, getItemQuality, getPenCapacity, getCooldown, getBaitUseChance } = require('../../utilities/userStats.js');


function findFoxes(user, foxCount, isMinion, iterations, tailCount) {
    const chance = getFoxChance(user, foxCount, isMinion, tailCount);
    const fquantityBonus = getFoxQuantity(user, foxCount, isMinion, tailCount);
    const fqualityBonus = getFoxQuality(user, foxCount, isMinion, tailCount);
    const kitsuneBonus = getKitsuneBonus(user, foxCount, isMinion, tailCount);
    user.stats ??= {};
    let foxes = new Map();
    if ((user.stats.numSearches ?? 0) === 8) {
        return foxes;
    }

    for (let i = 0; i < iterations; ++i) {
        if (Math.random() < chance || !canMiss(user)) {
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
            user.stats.dryStreak = 0;
        }
        else if (!isMinion) {
            user.stats.dryStreak = (user.stats.dryStreak ?? 0) + 1;
        }
    }

    user.foxes ??= {};
    user.stats.foxesFound ??= {};
    for (const [type, num] of foxes) {
        user.foxes[type] = (user.foxes[type] ?? 0) + num;
        user.stats.foxesFound[type] = (user.stats.foxesFound[type] ?? 0) + num;
    }

    return foxes;
}


function foxMessage(user, foxes, baitEnded, item, counter) {
    /* Fox Tally */
    let description = foxData.reduce((acc, type) => {
        const num = foxes.get(type.value);
        if (num) {
            return acc.concat(`**${num}** ${type.emoji}\n`);
        }
        return acc;
    }, "");
    const foundFoxes = (description !== "");
    if (!foundFoxes) {
        description = `You found no foxes :(\n`;
        if (counter) {
            if (counter >= 1000) {
                description = description.concat(`:hourglass: **100%** => **1** :fox:\n`);
            }
            else {
                description = description.concat(`${counter < 500 ? ":hourglass_flowing_sand:" : ":hourglass:"} **${counter / 10}%**\n`);
            }
        }
    }

    /* Overpopulation */
    const foxCount = countFoxes(user.foxes);
    const capacity = getPenCapacity(user);
    if (capacity < foxCount) {
        description = description.concat(`\nYour pen is overcrowded! (**${foxCount}/${capacity}**)\nYou have gained ${msToSec(getCooldown(user, foxCount) - getCooldown(user, capacity))} extra cooldown!\n`);
    }

    /* Bait */
    if (user.equips?.bait) {
        description = description.concat(`\n**${user.upgrades.coin.bait[user.equips.bait]}** ${shopData.find(c => c.value === "bait").upgrades.find(p => p.value === user.equips.bait).name} left!\n`);
    }
    if (baitEnded === "conserved") {
        description = description.concat("*(Conserved!)*\n");
    }
    else if (baitEnded !== "none") {
        description = description.concat(`\nYou ran out of ${baitEnded}!\n`);
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
    const wFoxCount = countFoxes(user.foxes, true);
    const isNice = foxCount === 69 || foxCount === 420 || wFoxCount === 69 || wFoxCount === 420;
    const embed = new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle(user.equips?.nets ? `${net.name} -` : "You found:")
        .setDescription(description)
        .setFooter({text: `You ${foundFoxes ? "now ": ""}have ${foxCount}${foxCount !== wFoxCount ? ` (${wFoxCount})` : ""} ${foxCount === 1 ? "fox" : "foxes"}! ${isNice ? "Nice!" : ""}`});
    return {embeds: [embed]};
}


function runTutorial(user, tutorial, condition, interaction) {
    if (!user.tutorials?.[tutorial] && condition) {
        user.tutorials ??= {};
        user.tutorials[tutorial] = true;

        interaction.followUp({content: tutorialData[tutorial].tutorial, ephemeral: true});
    }
}


const effectsRemovedOnItem = [
    "glass",
    "sslag",
    "cbait",
    "chain",
    "ball",
    "micro",
    "prec",
    "mbait",
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
            await interaction.reply({content: `You are still on cooldown for \`${msToSec(cooldown - now)}\``, ephemeral: true});
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
        let baitEnded = "none";
        if (user.equips?.bait) {
            if (Math.random() < getBaitUseChance(user, totalFoxes.size !== 0)) {
                const newBait = user.upgrades.coin.bait[user.equips.bait] - 1;
                user.stats ??= {};
                if (newBait === 0) {
                    baitEnded = shopData.find(c => c.value === "bait").upgrades.find(p => p.value === user.equips.bait).name;
                    user.equips.bait = undefined;
                }
                user.upgrades.coin.bait[user.equips.bait] = newBait;
                user.stats.baitConsumed = (user.stats.baitConsumed ?? 0) + 1;
            }
            else {
                baitEnded = "conserved";
                user.stats.baitConserved = (user.stats.baitConserved ?? 0) + 1;
            }
        }

        /* Calculate items earned */
        let item = undefined;
        if (canItems(user)) {
            if (getItemChance(user, tailCount) > Math.random()) {
                const iquality = getItemQuality(user, tailCount);
                const filteredItems = Object.keys(items).filter(itemVal => items[itemVal].rarity <= iquality && items[itemVal].rarity + 3 > iquality);
                item = filteredItems[Math.floor(Math.random() * filteredItems.length)];
            }
        }
        /* Hard-code first items as a "tutorial" */
        switch(user.stats?.numSearches ?? 0) {
            case 4:
                item = "fbox";
                break;
            case 11:
                item = "shoe";
                break;
            case 19:
                item = "bpack";
                break;
        }
        /* Get slot */
        if (item) {
            const userItems = user.items ?? {};
            let slot = userItems.findIndex(s => !s);
            if (slot === -1) { //if (findIndex fails)
                slot = userItems.length;
            }
            if (slot < 9) { //Max 9 items
                user.items ??= {};
                user.items[slot] = item;
            }
            item = `${slot}.${item}`;

            user.stats ??= {};
            user.stats.itemsFound = (user.stats.itemsFound ?? 0) + 1;
        }

        /* Fox Counter */
        let counter;
        if (totalFoxes.size === 0 && !item) {
            counter = (user.counter ?? 0) + Math.floor(getFoxChance(user, foxCount, false, tailCount) * 333);
            if (counter >= 1000) {
                user.counter = counter - 1000;
                user.foxes ??= {};
                user.foxes.orange = (user.foxes.orange ?? 0) + 1;
                user.stats ??= {};
                user.stats.foxesFound ??= {};
                user.stats.foxesFound.orange = (user.stats.foxesFound.orange ?? 0) + 1;
            }
            else {
                user.counter = counter;
            }
        }
    
        user.cooldown = now + getCooldown(user, foxCount);
        user.stats ??= {};
        user.stats.numSearches = (user.stats.numSearches ?? 0) + 1;
        await interaction.reply(foxMessage(user, totalFoxes, baitEnded, item, counter));

        /* Do tutorials */
        runTutorial(user, "start", true, interaction);
        runTutorial(user, "items", item !== undefined, interaction);
        runTutorial(user, "hourglass", totalFoxes.size === 0, interaction);
        runTutorial(user, "shrine", (user.foxes?.orange ?? 0) >= 30, interaction);
        runTutorial(user, "coins", (user.foxes?.orange ?? 0) >= 100, interaction);
        runTutorial(user, "rarefox", totalFoxes.has("grey"), interaction);

        await user.save();
	}
};

