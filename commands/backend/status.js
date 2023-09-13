const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("status")
		.setDescription("Checks the bot's status"),
	async execute() {
		return {content: "Bot online!"};
	}
};

