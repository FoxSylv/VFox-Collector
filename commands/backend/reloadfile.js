const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    isDev: true,
	data: new SlashCommandBuilder()
		.setName("reloadfile")
		.setDescription("Reloads the given file")
        .addStringOption(option =>
            option.setName("filename")
                  .setDescription("The file to reload")
                  .setRequired(true)),
	async execute(interaction) {
        const filename = interaction.options.getString("filename", true);
        if (filename === "index.js") {
            await interaction.reply("`index.js` cannot be reloaded!\n \
It causes issues from the pre-reload version never fully unloading.\n \
Turn the bot off and on again instead to avoid this issue.");
            return;
        }

        delete require.cache[require.resolve(`../../${filename}`)];
        try {
            require(`../../${filename}`);
            await interaction.reply(`${filename} was reloaded!`);
        }
        catch (error) {
            console.log(error);
            await interaction.reply(`There was an error while reloading ${filename}`);
        }
	}
};

