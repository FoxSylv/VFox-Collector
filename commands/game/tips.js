const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { getColor } = require('../../utilities/getColor.js');
const { tipData } = require('../../data/tipData.js');


function getTipScreen(user, currentTip) {
    let tipNum;
    do {
        tipNum = Math.floor(Math.random() * tipData.length);
    }
    while (currentTip === tipNum);

    const embed = new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle(`Tip #${tipNum + 1}`)
        .setDescription(tipData[tipNum])
    const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`tip.${tipNum}`)
            .setLabel("Another Tip")
            .setStyle(ButtonStyle.Success)
    );

    return {embeds: [embed], components: [button]};
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("tips")
		.setDescription("Get helpful hints about the game and how to play it"),
    buttonValues: tipData.map((tip, index) => `tip.${index}`),
    async buttonPress(user, customId) {
        const currentTip = customId.split('.')[1];
        return await getTipScreen(user, currentTip)
    },
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        await interaction.reply(getTipScreen(user));
    }
};

