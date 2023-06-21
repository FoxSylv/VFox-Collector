const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { User } = require('../../utilities/dbSchema.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("reset")
		.setDescription("Deletes your VFox profile. WARNING: You cannot undo this."),
	async execute(interaction) {
        const confirm = new ButtonBuilder()
			.setCustomId("confirm")
			.setLabel("Confirm")
			.setStyle(ButtonStyle.Danger);

		const cancel = new ButtonBuilder()
			.setCustomId("cancel")
			.setLabel("Cancel")
			.setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
			.addComponents(confirm, cancel);


        const response = await interaction.reply({content: "Are you sure you wish to delete your profile? **THIS CANNOT BE UNDONE!**", components: [row]});
        try {
        	const confirmation = await response.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id, time: 60000 });
            if (confirmation.customId === "confirm") {
                await User.deleteOne({_id: interaction.user.id});
                await confirmation.update({content: "You have deleted your VFox Profile.", components: []});
            }
            else {
                await confirmation.update({content: 'Profile deletion cancelled', components: []});
            }
        }
        catch (e) {
        	await interaction.editReply({content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
	}
};
