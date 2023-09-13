const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { foxData } = require('../../data/foxData.js');
const { getColor } = require('../../utilities/getColor.js');
const { countFoxes } = require('../../utilities/countFoxes.js');
const { canMiss, canItems, canRareFox, canKitsune, getFoxChance, getFoxQuantity, getFoxQuality, getKitsuneBonus, getItemChance, getItemQuality, getBaitUseChance } = require('../../utilities/userStats.js');

function toFoxVisual(foxes) {
    if (!foxes) {
        return "**None!**";
    }
    return foxData.map(type => {
        if (!foxes[type.dbvalue]) return undefined;
        return `**${foxes[type.dbvalue]}**${type.emoji}`;
    }).filter(f => f).join("/");
}
function toPercent(chance) {
    return `${Math.ceil(chance * 1000) / 10}%`;
}

function getStatScreen(user) {
    const hasDetails = user.equips?.activeEffects?.includes("stats") ?? false;
    const userStats = user.stats ?? {};
    let description = "";
    
    if (hasDetails) {
        const foxCount = countFoxes(user.foxes);
        const tailCount = (user.items ?? []).filter(i => i === "tail").length;
        description = description.concat(`Fox-Finding Chance: ${canMiss(user) ? toPercent(getFoxChance(user, foxCount, false, tailCount)) : "100%"}
Fox Quantity: ${getFoxQuantity(user, foxCount, false, tailCount)}
Fox Quality: ${canRareFox(user) ? `${getFoxQuality(user, foxCount, false, tailCount)}` : "N/A"}
Kitsune Bonus: ${canKitsune(user) ? `${getKitsuneBonus(user, tailCount, false, tailCount)}x` : "N/A"}
Item Chance: ${canItems(user) ? `${toPercent(getItemChance(user, tailCount))}` : "N/A"}
Item Quality: ${canItems(user) ? `${getItemQuality(user, tailCount)}` : "N/A"}
Bait Conservation Chance: ${toPercent(1 - getBaitUseChance(user, true))}\n\n`);
    }

    description = description.concat(`Total Hunts: **${userStats.numSearches ?? "None!"}**
Foxes Found: ${toFoxVisual(userStats.foxesFound)}
Current Dry Streak: **${userStats.dryStreak ?? 0}**
Shrine Purchases: **${userStats.shrinePurchases ?? "None!"}**
Foxes Forfeited: ${toFoxVisual(userStats.foxesForfeited)}
Shop Purchases: **${userStats.shopPurchases ?? "None!"}**
Foxes Sold: ${toFoxVisual(userStats.foxesSold)}
Items Found: **${userStats.itemsFound ?? "None!"}**
Items Used: **${userStats.itemsUsed ?? "None!"}**
Bait Consumed: **${userStats.baitConsumed ?? "None!"}**
Bait Conserved: **${userStats.baitConserved ?? "None!"}**`);


    const embed = new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle("Your Stats -")
        .setDescription(description)
        .setFooter({text: `You have ${hasDetails ? "" : "not yet "}unlocked the detailed stat screen!`});;

    return {embeds: [embed]};
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Look at your info!"),
	async execute(user) {
        return getStatScreen(user);
    }
};

