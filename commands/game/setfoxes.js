const { SlashCommandBuilder } = require('discord.js');
const { User, getProfile } = require('../../utilities/db.js');

module.exports = {
    isDev: true,
	data: new SlashCommandBuilder()
		.setName("setfoxes")
		.setDescription("Magically apparate foxes")
        .addIntegerOption(option =>
            option.setName("foxes")
                  .setDescription("Number of foxes to apparate")
                  .setRequired(true)
                  .setMinValue(0)
        ),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const newFoxes = interaction.options.getInteger("foxes");
        user.foxes ??= {};
        user.foxes.orange = newFoxes;
        await interaction.reply(`You now have ${newFoxes} foxes!`);
        await user.save();
	}
};

