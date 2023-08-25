const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { foxData } = require('../../data/foxData.js');
const { getColor } = require('../../utilities/getColor.js');

function toFoxVisual(foxes) {
    if (!foxes) {
        return "**None!**";
    }
    return foxData.map(type => {
        if (!foxes[type.dbvalue]) return undefined;
        return `**${foxes[type.dbvalue]}**${type.emoji}`;
    }).filter(f => f).join("/");
}

function getStatScreen(user) {
    const hasDetails = user.equips?.activeEffects?.includes("stats") ?? false;
    const userStats = user.stats ?? {};
    let description = "";
    
    if (hasDetails) {
        description = description.concat("Detailed Stats - TODO!\n\n");
    }

    description = description.concat(`Total Hunts: **${userStats.numSearches ?? "None!"}**
Foxes Found: ${toFoxVisual(userStats.foxesFound)}
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
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        await interaction.reply(getStatScreen(user));
    }
};

