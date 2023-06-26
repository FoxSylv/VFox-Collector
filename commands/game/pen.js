const { SlashCommandBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName("pen")
		.setDescription("Look inside your fox pen!"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const foxes = user.foxes ?? 0;
        const coins = user.coins ?? 0;

        let responseText = "";
        if (foxes === 0) {
            responseText = responseText.concat("You have no foxes :(");
        }
        else {
            responseText = responseText.concat(`You have ${(foxes === 1) ? `a fox` : `${foxes} foxes`}! :fox:`);
	    }

        if (coins > 0) {
            responseText = responseText.concat(`\nYou have ${(coins === 1) ? `a coin` : `${coins} coins`} :coin:`);
        }

        await interaction.reply(responseText);
    }
};

