const { SlashCommandBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("equip")
		.setDescription("Equip"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        await user.save();
	}
};

