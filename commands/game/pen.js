const { SlashCommandBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName("pen")
		.setDescription("Look inside your fox pen!"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const foxes = user.foxes ?? 0;
        if (foxes === 0) {
            interaction.reply("You have no foxes :(");
        }
        else {
            interaction.reply(`You have ${(foxes === 1) ? `a fox` : `${foxes} foxes`}! :fox:`);
	    }
    }
};

