const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { countFoxes } = require('../../utilities/countFoxes.js');
const { foxData } = require('../../data/foxData.js');
const { getColor } = require('../../utilities/getColor.js');

const shrinePurchases = [
    {name: "Kitsune's Blessing", value: "blessingCount", basePrice: 30, description: "Marginally increase the odds to find foxes"},
    {name: "Kitsune's Minion", value: "minionCount", basePrice: 50, description: "Find more foxes at a time"},
    {name: "Kitsune's Watcher", value: "watcherCount", basePrice: 70, description: "Increase pen capacity"},
    {name: "Kitsune's Eyesight", value: "eyesightCount", basePrice: 100, description: "Find more items"},
    {name: "Kitsune's Haste", value: "hasteCount", basePrice: 160, description: "Reduce cooldown times"},
    {name: "Kitsune's Luck", value: "luckCount", basePrice: 190, description: "Find rarer foxes"},
    {name: "Kitsune's Journal", value: "journalCount", basePrice: 300, description: "Reduce bait loss"},
    {name: "Kitsune's Curiosity", value: "curiosityCount", basePrice: 900, description: "Increased chance to find kitsunes specifically"}
];

function getPrice(user, purchase) {
    return purchase.basePrice * ((user.upgrades?.shrine?.[purchase.value] ?? 0) + 1);
}

function getShrineShopEmbed(user) {
    let description = shrinePurchases.reduce((acc, purchase) => {
            return acc.concat(`• **${purchase.name}** (${getPrice(user, purchase)}:fox:): ${purchase.description}\n`);
        }, "");
    const tailCount = (user.items ?? []).filter(i => i === "tail").length;
    description = description.concat(`• **${tailCount === 0 ? "?????????" : "Kitsune's Tail"}** (${tailCount >= 9 ? "**MAX**" : `${1111 * (tailCount + 1)}:fox:`}): ${tailCount === 0 ? "?????????" : "A blessing bestowed by the fluffy deities"}`);

    return new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle("The Shrine")
        .setDescription(description)
        .setFooter({text: `You have ${countFoxes(user.foxes)} foxes!`});
}

const tailMessages = [
    "Woah! You gain a fluffy new appendage. You wonder what happens if you get all nine\n(Fox-finding luck increased)",
    "A second tail! You are making wonderful progress towards getting all nine!\n(Fox-finding luck increased)",
    "Tail number three! These are starting to get harder to get, but I'm certain you can get all nine!\n(Item and fox quality increased)",
    "The fourth tail has been acquired! You're almost halfway there!\n(Fox-finding luck increased)",
    "Tail number five! 55% of the way to all nine! You're over halfway!\n(Fox-finding luck increased)",
    "The sixth tail is yours. They're starting to get a little unwieldly, but I'm sure you can push onwards! (Item and fox quality increased)",
    "Tail seven. That's a lucky number! Surely that has to mean something, right?\n(Fox-finding luck greatly increased)",
    "One tail left! The finish line is in sight. You can do this!\n(Fox-finding luck greatly increased)",
    "As you acquire the final tail, a rush of energy surges through you. Welcome to the god tiers\n(NOTE: The god tiers have not yet been implemented. Poke @foxsylv on discord)"
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName("shrine")
		.setDescription("Release foxes at the shrine for rewards!")
        .addStringOption(option =>
            option.setName("upgrade")
                  .setDescription("The upgrade to buy")
                  .addChoices(...(shrinePurchases.map(p => JSON.parse(`{"name": "${p.name}", "value": "${p.value}"}`))).concat([{name: "Upgrade Nine", value: "tail"}]))
        ),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const upgrade = interaction.options.getString("upgrade");
        if (!upgrade) {
            await interaction.reply({embeds: [getShrineShopEmbed(user)]});
            return;
        }

        if (upgrade === "tail") {
            const userItems = user.items ?? [];
            
            let slot = userItems.findIndex(i => !i);
            if (slot === -1) { //if(findIndex fails)
                slot = userItems.length;
            }
            if (slot >= 9) {
                await interaction.reply("You need a free item slot to acquire this!");
                return;
            }

            const prevTailCount = userItems.filter(i => i === "tail").length;
            user.items ??= [];
            user.items[slot] = "tail";
            user.upgrades = undefined;
            user.coins = undefined;
            user.foxes = undefined;
            user.cooldown = undefined;
            user.equips = undefined;
            await user.save();
            await interaction.reply(`${tailMessages[prevTailCount]}`);
            return;
        }

        const purchase = shrinePurchases.find(p => p.value === upgrade);
        const price = getPrice(user, purchase);
        const userUpgrade = user.upgrades?.shrine?.[upgrade] ?? 0;
        if (countFoxes(user.foxes) >= price) {
            user.upgrades ??= {};
            user.upgrades.shrine ??= {};
            user.upgrades.shrine[upgrade] = userUpgrade + 1;

            let priceLeft = price;
            foxData.forEach(type => {
                if (!user.foxes[type.value]) return;
                const delta = Math.min(priceLeft, user.foxes[type.value]);
                user.foxes[type.value] -= delta;
                priceLeft -= delta;
            });

            user.stats ??= {};
            user.stats.shrinePurchases = (user.stats.shrinePurchases ?? 0) + 1;
            interaction.reply(`You got a **${purchase.name}**! (You now have ${user.upgrades.shrine[upgrade]})`);
        }
        else {
            interaction.reply(`You do not have enough foxes for a **${purchase.name}**... (${countFoxes(user.foxes)}/${price})`);
        }
        await user.save();
	}
};

