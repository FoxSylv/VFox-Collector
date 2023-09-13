const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    isDev: true,
	data: new SlashCommandBuilder()
		.setName("reload")
		.setDescription("Reloads a command")
        .addStringOption(option =>
			option.setName("command")
				  .setDescription("The command to reload")
				  .setRequired(true)),
	async execute(user, options) {
        const commandName = options.getString("command", true).toLowerCase();
		const command = interaction.client.commands[commandName];

		if (!command) {
			return {content: `There is no command with name \`${commandName}\`!`};
		}

        delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];

        try {
	        const newCommand = require(`../${command.category}/${command.data.name}.js`);
            newCommand.category = command.category;
	        interaction.client.commands[newCommand.data.name] = newCommand;
    	    return {content: `Command \`${newCommand.data.name}\` was reloaded!`};
        }
        catch (error) {
	        console.error(error);
        	return {content: `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``};
        }
	}
};

