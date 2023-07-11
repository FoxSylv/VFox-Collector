const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { countFoxes } = require('../../utilities/countFoxes.js');
const { foxEmoji } = require('../../data/foxEmoji.js');

const shrinePurchases = [
    {name: "Kitsune's Blessing", value: "blessingCount", basePrice: 20, description: "Gain slightly increased fox finding luck"},
    {name: "Helper Minion", value: "minionCount", basePrice: 50, description: "Get a little friend to help you find more foxes at a time"},
    {name: "Pen Watcher", value: "watcherCount", basePrice: 75, description: "Reduce the cooldown from having a lot of foxes"}
];

function getPrice(user, purchase) {
    return purchase.basePrice * ((user.upgrades?.shrine[purchase.value] ?? 0) + 1);
}

function getShrineShopEmbed(user) {
    return new EmbedBuilder()
        .setColor(0xEA580C)
        .setTitle("The Shrine")
        .setDescription(shrinePurchases.reduce((acc, purchase) => {
            return acc.concat(`• **${purchase.name}** (${getPrice(user, purchase)}:fox:): ${purchase.description}\n`);
        }, ""))
        .setFooter({text: `You have ${countFoxes(user.foxes)} foxes!`});
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
        const upgrade = interaction.options.getString("upgrade");
        if (!upgrade) {
            interaction.reply({embeds: [getShrineShopEmbed(user)]});
            return;
        }

        const purchase = shrinePurchases.find(p => p.value === upgrade);
        const price = getPrice(user, purchase);
        const userUpgrade = user.upgrades.shrine[upgrade] ?? 0;
        if (countFoxes(user.foxes) >= price) {
            user.upgrades ??= {};
            user.upgrades.shrine ??= {};
            user.upgrades.shrine[upgrade] = userUpgrade + 1;

            let priceLeft = price;
            foxEmoji.forEach(type => {
                const delta = Math.min(priceLeft, user.foxes[type.value]);
                user.foxes[type.value] -= delta;
                priceLeft -= delta;
            });

            user.stats ??= {};
            user.stats.shrinePurchases = (user.stats.shrinePurchases ?? 0) + 1;
            interaction.reply(`You got a **${purchase.name}**! (You now have ${user.upgrades.shrine[upgrade]})`);
        }
        else {
            interaction.reply(`You do not have enough foxes for a **${purchase.name}**... (${user.foxes}/${price})`);
        }
        await user.save();
	}
};

