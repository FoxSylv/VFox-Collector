const { SlashCommandBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { foxData } = require('../../data/foxData.js');
const { countFoxes } = require('../../utilities/countFoxes.js');

const data = new SlashCommandBuilder()
    .setName("setfoxes")
    .setDescription("Magically apparate foxes");
foxData.forEach(f => data.addIntegerOption(option => 
    option.setName(f.value)
          .setDescription(`Number of ${f.value} foxes to apparate`)
          .setMinValue(0))
);

module.exports = {
    isDev: true,
	data: data,
	async execute(user, options) {
        user.foxes ??= {};
        foxData.forEach(f => user.foxes[f.value] = (options.getInteger(f.value) ?? 0));
        await user.save();
        return {content: `You now have ${countFoxes(user.foxes)} foxes!`};
	}
};

