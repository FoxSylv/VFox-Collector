const { SlashCommandBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData} = require('../../data/shopData.js');

module.exports = {
    isDev: true,
	data: new SlashCommandBuilder()
		.setName("toggleupgrade")
		.setDescription("Toggles an upgrade from the shop")
        .addStringOption(option =>
            option.setName("upgrade")
                  .setDescription("The upgrade to toggle")
                  .setRequired(true)
                  .addChoices(...shopData.filter(c => c.value !== "items" && c.value !== "bait").flatMap(c => c.upgrades.map(p => JSON.parse(`{"name": "${p.name}", "value": "${c.value + '.' + p.value}"}`))))
        ),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const upgrade = interaction.options.getString("upgrade");
        const split = upgrade.split('.');
        const category = shopData.find(c => c.value === split[0]);
        const upgradeData = category.upgrades.find(u => u.value === split[1]);

        const hasUpgrade = user.upgrades?.coin?.[category.value]?.[upgradeData.value] ?? false;
        user.upgrades ??= {};
        user.upgrades.coin ??= {};
        user.upgrades.coin[category.value] ??= {};
        user.upgrades.coin[category.value][upgradeData.value] = !hasUpgrade;
        await interaction.reply(`Toggled ${upgradeData.name}!`);
        await user.save();
	}
};

