const { SlashCommandBuilder } = require('discord.js');
const { User, getProfile } = require('../../utilities/db.js');

function getChance(user) {
    const foxes = user.foxes ?? 0;
    return 0.97 ** foxes;
}

function findFoxes(user) {
    return 1;
}

function getCooldown(user) {
    const foxes = user.foxes ?? 0;
    return 5000 + foxes;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("fox")
		.setDescription("Go searching for foxes!"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const cooldown = user.cooldown;
        const now = Date.now();
        if (now < cooldown) {
            const cooldownLeft = Math.ceil((cooldown - now) / 100) / 10;
            await interaction.reply(`You are still on cooldown for \`${cooldownLeft}${(cooldownLeft === Math.ceil(cooldownLeft) ? `.0` : ``)}\` seconds`);
            return;
        }

        if (!user.stats) user.stats = {} 
        const oldSearches = user.stats?.numSearches ?? 0;
        user.stats.numSearches = oldSearches + 1;

        const chance = getChance(user);
        if (Math.random() < chance) {
            const foundFoxes = findFoxes(user);
            const newFoxes = (user.foxes ?? 0) + foundFoxes;
            const newFoxesFound = (user.stats?.foxesFound ?? 0) + foundFoxes;

            user.foxes = newFoxes;
            user.stats.foxesFound = newFoxesFound;

    		await interaction.reply(`You found ${(foundFoxes === 1) ? "a fox" : `${foundFoxes} foxes`}! :fox:`);
        }
        else {
            await interaction.reply(`You did not find any foxes :(`);
        }

        user.cooldown = now + getCooldown(user);
        await user.save();
	}
};

