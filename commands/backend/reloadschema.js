const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    isDev: true,
	data: new SlashCommandBuilder()
		.setName("reloadschema")
		.setDescription("Reloads the database schema"),
	async execute(interaction) {
        delete require.cache[require.resolve(`../../utilities/dbSchema.js`)];
        delete mongoose.connection.models["User"];
        try {
            require(`../../utilities/dbSchema.js`);
            await interaction.reply(`Database schema was reloaded!`);
        }
        catch (error) {
            console.log(error);
            await interaction.reply(`There was an error while reloading the database schema`);
        }
	}
};

