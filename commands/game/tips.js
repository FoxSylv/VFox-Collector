const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { getColor } = require('../../utilities/getColor.js');
const { tipData } = require('../../data/tipData.js');


function getTipScreen(user, tipNum) {
    const embed = new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle(`Tip #${tipNum + 1}`)
        .setDescription(tipData[tipNum])
    const buttons = new ActionRowBuilder();
    if (tipNum > 0) {
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`tips.${tipNum - 1}`)
                .setLabel("Previous")
                .setStyle(ButtonStyle.Primary)
        )
    }
    if (tipNum < tipData.length - 1) {
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`tips.${tipNum + 1}`)
                .setLabel("Next")
                .setStyle(ButtonStyle.Primary)
        )
    }
    buttons.addComponents(
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
        if (customId === "tips.randomtip") {
            currentTip = Math.floor(Math.random() * tipData.length);
        }
        else {
            currentTip = customId.split('.')[1];
        }
        return await getTipScreen(user, parseInt(currentTip))
    },
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        await interaction.reply(getTipScreen(user, 0));
    }
};

