const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { foxEmoji } = require('../../data/foxEmoji.js');
const { countFoxes } = require('../../utilities/countFoxes.js');


function getPenScreen(user) {
    let description = (countFoxes(user.foxes) === 0 && (user.coins ?? 0) === 0) ? "You have no foxes :(\n" : foxEmoji.reduce((acc, type) => {
        if ((user.foxes[type.value] ?? 0) !== 0) {
            return acc.concat(`**${user.foxes[type.value]}** ${type.emoji}\n`);
        }   
        return acc;
    }, "");
    if ((user.coins ?? 0) !== 0) {
        description = description.concat(`**${user.coins}** :coin:\n`);
    }   

    const pen = shopData.find(c => c.value === "pens").upgrades.find(u => u.value === user.equips?.pens);
    const embed = new EmbedBuilder()
        .setColor(0xEA580C)
        .setTitle(user.equips?.pens ? `${pen.name} -` : "Your Pen - ")
        .setDescription(description);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('toBait')
            .setLabel(`${shopData.find(c => c.value === "bait").emoji} Bait Box`)
            .setStyle(ButtonStyle.Primary)
    );
    return user.upgrades?.coin?.bait ? {embeds: [embed], components: [row]} : {embeds: [embed]};
}
function getBaitBox(user) {
    let description = shopData.find(c => c.value === "bait").upgrades.reduce((acc, bait) => {
        const hasOwned = user.upgrades?.coin?.bait?.[bait.value] !== undefined;
        return acc.concat(hasOwned ? `${user.equips?.bait === bait.value ? ":ballot_box_with_check:" : ":blue_square:"} **${bait.name}** (${user.upgrades.coin.bait[bait.value]} left)\n` : "");
    }, "");
    if (description === "") {
        description = "You have no bait!";
    }

    const embed = new EmbedBuilder()
        .setColor(0xEA580C)
        .setTitle(`${shopData.find(c => c.value === "bait").emoji} Bait Box`)
        .setDescription(description);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('toPen')
            .setLabel(`⬅️ Back`)
            .setStyle(ButtonStyle.Secondary)
    );  
    return {embeds: [embed], components: [row]};
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pen")
		.setDescription("Look inside your fox pen!"),
    buttonValues: ["toPen", "toBait"],
    async buttonPress(user, customId) {
        return customId === "toPen" ? getPenScreen(user) : getBaitBox(user);
    },
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        await interaction.reply(getPenScreen(user));
    }
};

