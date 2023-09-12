const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { User } = require('../../data/dbSchema.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("reset")
		.setDescription("Deletes your VFox profile. WARNING: You cannot undo this."),
    async buttonPress(user, customId) {
        if (customId === "reset.confirm") {
            await User.findByIdAndDelete(user._id);
            return {content: "You have deleted your VFox Profile.", components: []};
        }
        else {
            return {content: 'Profile deletion cancelled', components: []};
        }
    },
	async execute(interaction) {
        const confirm = new ButtonBuilder()
			.setCustomId("reset.confirm")
			.setLabel("Confirm")
			.setStyle(ButtonStyle.Danger);

		const cancel = new ButtonBuilder()
			.setCustomId("reset.cancel")
			.setLabel("Cancel")
			.setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
			.addComponents(confirm, cancel);

        await interaction.reply({content: "Are you sure you wish to delete your profile? **THIS CANNOT BE UNDONE!**", components: [row]});
	}
};
