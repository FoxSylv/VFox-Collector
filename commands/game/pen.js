const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { foxData } = require('../../data/foxData.js');
const { countFoxes } = require('../../utilities/countFoxes.js');
const { getColor } = require('../../utilities/getColor.js');


function getPenScreen(user) {
    let description = (countFoxes(user.foxes) === 0 && (user.coins ?? 0) === 0) ? "You have no foxes :(\n" : foxData.reduce((acc, type) => {
        if ((user.foxes[type.value] ?? 0) !== 0) {
            return acc.concat(`**${user.foxes[type.value]}** ${type.emoji}\n`);
        }   
        return acc;
    }, "");

    const pen = shopData.find(c => c.value === "pens").upgrades.find(u => u.value === user.equips?.pens);
    const embed = new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle(user.equips?.pens ? `${pen.name} -` : "Your Pen - ")
        .setDescription(description)
        .setFooter({text: `You have ${user.coins ?? 0} coin${user.coins === 1 ? "" : "s"}`});;

    return {embeds: [embed]};
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pen")
		.setDescription("Look inside your fox pen!"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        await interaction.reply(getPenScreen(user));
    }
};

