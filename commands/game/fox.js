const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { foxData } = require('../../data/foxData.js');
const { shrineData } = require('../../data/shrineData.js');
const { items } = require('../../utilities/items.js');
const { countFoxes } = require('../../utilities/countFoxes.js');
const { msToSec } = require('../../utilities/msToSec.js');
const { getColor } = require('../../utilities/getColor.js');
const { canItems, canRareFox, canKitsune, getFoxChance, getFoxQuantity, getFoxQuality, getKitsuneBonus, getItemChance, getItemQuality, getPenCapacity, getCooldown, getBaitUseChance } = require('../../utilities/userStats.js');


function findFoxes(user, foxCount, isMinion, iterations, tailCount) {
    const chance = getFoxChance(user, foxCount, isMinion, tailCount);
    const fquantityBonus = getFoxQuantity(user, foxCount, isMinion, tailCount);
    const fqualityBonus = getFoxQuality(user, foxCount, isMinion, tailCount);
    const kitsuneBonus = getKitsuneBonus(user, foxCount, isMinion, tailCount);

    user.stats ??= {};
    let foxes = new Map();
    for (let i = 0; i < iterations; ++i) {
        if (Math.random() < chance || (!user.upgrades.coin && (user.stats?.dryStreak > 3))) {
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
    const embed = new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle(user.equips?.nets ? `${net.name} -` : "You found:")
        .setDescription(description)
        .setFooter({text: `You ${foundFoxes ? "now ": ""}have ${foxCount} ${foxCount === 1 ? "fox" : "foxes"}! ${(foxCount === 69 || foxCount === 420) ? "Nice!" : ""}`});
    return {embeds: [embed]};
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

                user.stats ??= {};
                user.stats.itemsFound = (user.stats.itemsFound ?? 0) + 1;
            }
        }
    
        user.cooldown = now + getCooldown(user, foxCount);
        user.stats ??= {};
        user.stats.numSearches = (user.stats.numSearches ?? 0) + 1;
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

