const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { getColor } = require('../../utilities/getColor.js');
const { tipData } = require('../../data/tipData.js');


function getTipScreen(user, tipNum) {
    const embed = new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle(`Tip #${tipNum + 1}`)
        .setDescription(tipData[tipNum])
    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`tips.${tipNum - 1}`)
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(tipNum <= 0),
        new ButtonBuilder()
            .setCustomId(`tips.${tipNum + 1}`)
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(tipNum >= tipData.length - 1),
        new ButtonBuilder()
            .setCustomId(`tips.randomtip`)
            .setLabel("Random Tip")
            .setStyle(ButtonStyle.Success)
    );

    return {embeds: [embed], components: [buttons]};
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("tips")
		.setDescription("Get helpful hints about the game and how to play it"),
    async buttonPress(user, customId) {
        let currentTip;
        if (customId.split('.')[1] === "randomtip") {
            currentTip = Math.floor(Math.random() * tipData.length);
        }
        else {
            currentTip = customId.split('.')[1];
        }
        return await getTipScreen(user, parseInt(currentTip))
    },
	async execute(user) {
        return getTipScreen(user, 0);
    }
};

