const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { foxData } = require('../../data/foxData.js');
const { countFoxes } = require('../../utilities/countFoxes.js');
const { getColor } = require('../../utilities/getColor.js');


function getPenScreen(user) {
    const counter = user.counter ?? 0;
    let description = (countFoxes(user.foxes) === 0 && counter === 0) ? "You have no foxes :(\n" : `${counter < 500 ? ":hourglass_flowing_sand:" : ":hourglass:"} **${counter / 10}%**\n`.concat(foxData.reduce((acc, type) => {
        if ((user.foxes[type.value] ?? 0) !== 0) {
            return acc.concat(`**${user.foxes[type.value]}** ${type.emoji}\n`);
        }   
        return acc;
    }, ""));

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

