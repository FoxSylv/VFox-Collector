const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { foxEmoji } = require('../../data/foxEmoji.js');
const { countFoxes } = require('../../utilities/countFoxes.js');


function invSum(start, end) {
    let result = 0;
    for (let i = start; i < end; ++i) {
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
    const fqualityBonus = (getAllBonuses(user, "foxQuality") + invSum(3, 3 + (user.upgrades?.shrine?.luckCount ?? 0))) * (isMinion ? 0.4 : 1);
    const kitsuneBonus = isMinion ? 0 : (1 + (getAllBonuses(user, "kitsune") / 10) + invSum(15, 15 + (user.upgrades?.shrine?.curiosityCount ?? 0)));
    console.log(`${chance}, ${fquantityBonus}`);

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


function foxMessage(user, foxes, item) {
    const description = foxEmoji.reduce((acc, type) => {
        const num = foxes.get(type.value);
        if (num) {
            return acc.concat(`**${num}** ${type.emoji}\n`);
        }
        return acc;
    }, "");
    const foxCount = countFoxes(user.foxes);

    const net = shopData.find(c => c.value === "nets").upgrades.find(u => u.value === user.equips?.nets);
    const embed = new EmbedBuilder()
        .setColor(0xEA580C)
        .setTitle(user.equips?.nets ? `${net.name} -` : "You found:")
        .setDescription(description === "" ? "You found no foxes :(" : description)
        .setFooter({text: `You now have ${foxCount} ${foxCount === 1 ? "fox" : "foxes"}!`});
    return {embeds: [embed]};
}


function getCooldown(user, foxCount) {
    const baseCooldown = getAllBonuses(user, "cooldown");
    const penalty = getAllBonuses(user, "penalty");
    const max = getAllBonuses(user, "max") + ((user.upgrades?.shrine?.watcherCount ?? 0) * 10);

    return (baseCooldown + penalty * Max.max(0, (user.foxes ?? 0) - max)) / invSum(1, 1 + (user?.upgrades?.shrine?.hasteCount ?? 0));
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

        /* Calculate items earned */
        let item = undefined;
        if (canItems(user)) {
            //TODO: ITEMS
        }
        
        await user.save();
        await interaction.reply(foxMessage(user, totalFoxes, item));
	}
};

