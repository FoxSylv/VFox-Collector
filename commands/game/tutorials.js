const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { getColor } = require('../../utilities/getColor.js');
const { tutorialData } = require('../../data/tutorialData.js');


function getTutorialScreen(user, tutorialNum) {
    const unlockedTutorials = Object.keys(tutorialData).filter(t => user.tutorials?.[t]);
    const currentTutorial = tutorialData[unlockedTutorials[tutorialNum]];
    const embed = new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle(`${currentTutorial.title} Tutorial`)
        .setDescription(currentTutorial.tutorial)
    const buttons = new ActionRowBuilder();
    if (tutorialNum > 0) {
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`tutorial.${tutorialNum - 1}`)
                .setLabel("Previous")
                .setStyle(ButtonStyle.Primary)
        )
    }
    if (tutorialNum < unlockedTutorials.length - 1) {
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`tutorial.${tutorialNum + 1}`)
                .setLabel("Next")
                .setStyle(ButtonStyle.Primary)
        )
    }

    return unlockedTutorials.length === 1 ? {embeds: [embed]} : {embeds: [embed], components: [buttons]};
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("tutorials")
		.setDescription("Review previously seen tutorials"),
    buttonValues: Object.keys(tutorialData).map((tutorial, index) => `tutorial.${index}`),
    async buttonPress(user, customId) {
        let currentTutorial = customId.split('.')[1];
        return await getTutorialScreen(user, parseInt(currentTutorial))
    },
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        if (!user.tutorials) {
            await interaction.reply("You have not yet viewed any tutorials! Use `/fox` to get started!");
            return;
        }
        await interaction.reply(getTutorialScreen(user, 0));
    }
};

