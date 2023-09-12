const { SlashCommandBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');

module.exports = {
    isDev: true,
	data: new SlashCommandBuilder()
		.setName("setcoins")
		.setDescription("Magically apparate coins")
        .addIntegerOption(option =>
            option.setName("coins")
                  .setDescription("Number of coins to apparate")
                  .setRequired(true)
                  .setMinValue(0)
        ),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const newCoins = interaction.options.getInteger("coins");
        user.coins = newCoins;
        await interaction.reply(`You now have ${newCoins} :coin:!`);
        await user.save();
	}
};

