const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User, getProfile } = require('../../utilities/db.js');

const shrinePurchases = [
    {name: "Kitsune's Blessing", value: "blessingCount", basePrice: 20, description: "Gain slightly increased fox finding luck"},
    {name: "Helper Minion", value: "minionCount", basePrice: 50, description: "Get a little friend to help you find more foxes at a time"},
    {name: "Pen Watcher", value: "watcherCount", basePrice: 75, description: "Reduce the cooldown from having a lot of foxes"}
];

function getPrice(user, purchase) {
    return purchase.basePrice * ((user.upgrades[purchase.value] ?? 0) + 1);
}

function getShrineShopEmbed(user) {
    return new EmbedBuilder()
        .setColor(0xEA580C)
        .setTitle("The Shrine")
        .setDescription(shrinePurchases.reduce((acc, purchase) => {
            return acc.concat(`• **${purchase.name}** (${getPrice(user, purchase)}:fox:): ${purchase.description}\n`);
        }, ""))
        .setFooter({text: "May the kitsune smile down onto all of us"});
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName("shrine")
		.setDescription("Release foxes at the shrine for rewards!")
        .addStringOption(option =>
            option.setName("upgrade")
                  .setDescription("The upgrade to buy")
                  .addChoices(...shrinePurchases.map(p => JSON.parse(`{"name": "${p.name}", "value": "${p.value}"}`)))
        ),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        user.upgrades ??= {};
        const upgrade = interaction.options.getString("upgrade");
        if (!upgrade) {
            interaction.reply({embeds: [getShrineShopEmbed(user)]});
            return;
        }

        let purchase = shrinePurchases.find(p => p.value === upgrade);
        let price = getPrice(user, purchase);
        let userUpgrade = user.upgrades[upgrade] ?? 0;
        if (user.foxes >= price) {
            user.upgrades[upgrade] = userUpgrade + 1;
            user.foxes -= price;
            interaction.reply(`You got a **${purchase.name}**! (You now have ${user.upgrades[upgrade]})`);
        }
        else {
            interaction.reply(`You do not have enough foxes for a **${purchase.name}**... (${user.foxes}/${price})`);
        }
        user.save();
	}
};

