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
    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`tutorials.${tutorialNum - 1}`)
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(tutorialNum <= 0),
        new ButtonBuilder()
            .setCustomId(`tutorials.${tutorialNum + 1}`)
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(tutorialNum >= unlockedTutorials.length - 1)
        )

    return {embeds: [embed], components: [buttons]};
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("tutorials")
		.setDescription("Review previously seen tutorials"),
    async buttonPress(user, customId) {
        let currentTutorial = customId.split('.')[1];
        return getTutorialScreen(user, parseInt(currentTutorial))
    },
	async execute(interaction) {
        if (!user.tutorials) {
            return {content: "You have not yet viewed any tutorials! Use `/fox` to get started!"};
        }
        return getTutorialScreen(user, 0);
    }
};

