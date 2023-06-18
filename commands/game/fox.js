const { SlashCommandBuilder } = require('discord.js');
const { User, getProfile } = require('../../utilities/db.js');

function getChance(user) {
    const foxes = user.foxes ?? 0;
    const blessings = user.upgrades?.blessingCount ?? 0;
    return (0.97 ** foxes) * (1 + 0.2 * blessings);
}

function findFoxes(user) {
    const helpers = user.upgrades?.helperCount ?? 0;
    let foxes = 1;
    for (let i = 0; i < helpers; ++i) {
        if (Math.random() < 0.5) {
            ++foxes;
        }
    }
    return foxes;
}

function getCooldown(user) {
    const foxes = user.foxes ?? 0;
    const watchers = user.upgrades?.watcherCount ?? 0;
    return 5000 + Math.min((100 * (foxes - 40)) * (0.8 ** watchers), 0);
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

