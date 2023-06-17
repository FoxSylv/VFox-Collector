const { SlashCommandBuilder } = require('discord.js');
const { User, getProfile } = require('../../utilities/db.js');

function getNewChance(oldChance, user) {
    return oldChance * 0.97;
}

function findFoxes(user) {
    return 1;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("fox")
		.setDescription("Go searching for foxes!"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const chance = (user.foxChance ?? 1);
        if (Math.random() < chance) {
            const foundFoxes = findFoxes(user);
            const newFoxes = (user.foxes ?? 0) + foundFoxes;
            if (!user.stats) user.stats = {};
            const newFoxesFound = (user.stats?.foxesFound ?? 0) + foundFoxes;

            user.foxes = newFoxes;
            user.stats.foxesFound = newFoxesFound;
            user.foxChance = getNewChance(chance, user);

            await user.save();
    		await interaction.reply(`You found ${(foundFoxes === 1) ? "a fox" : `${foundFoxes} foxes`}!`);
        }
        else {
            await interaction.reply(`You did not find any foxes :(`);
        }
	}
};

