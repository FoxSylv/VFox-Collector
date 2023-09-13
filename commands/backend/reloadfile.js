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
	async execute(user, options) {
        const filename = options.getString("filename", true);
        if (filename === "index.js") {
            return {content: "`index.js` cannot be reloaded!\n \
It causes issues from the pre-reload version never fully unloading.\n \
Turn the bot off and on again instead to avoid this issue."};
        }
        else if (filename === "data/dbSchema.js") {
            return {content: "`data/dbSchema.js` cannot be reloaded!\n \
It causes issues from the pre-reload version never fully unloading.\n \
Turn the bot off and on again instead to avoid this issue."};
        }

        delete require.cache[require.resolve(`../../${filename}`)];
        try {
            require(`../../${filename}`);
            return {content: `${filename} was reloaded!`};
        }
        catch (error) {
            console.log(error);
            return {content: `There was an error while reloading ${filename}`};
        }
	}
};

