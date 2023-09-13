const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { countFoxes } = require('../../utilities/countFoxes.js');
const { foxData } = require('../../data/foxData.js');
const { shrineData } = require('../../data/shrineData.js');
const { getColor } = require('../../utilities/getColor.js');


function getPrice(user, purchase) {
    return purchase.basePrice * ((user.upgrades?.shrine?.[purchase.value] ?? 0) + 1);
}

function getShrineShopEmbed(user, tailCount) {
    let description = shrineData.reduce((acc, purchase) => {
            return acc.concat(`${purchase.emoji} **${purchase.name}** (${getPrice(user, purchase).toLocaleString("en-US")}:fox:): ${purchase.description}\n`);
        }, "");
    if (tailCount === 0) {
        description = description.concat(":question: **????????** (1,111:fox:): ????????");
    }
    else {
        description = description.concat(`:sewing_needle: **Kitsune's Tail** (${tailCount >= 9 ? "**MAX**" : `${(1111 * (tailCount + 1)).toLocaleString("en-US")}:fox:`}): A blessing bestowed by the fluffy deities`);
    }

    return new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle("The Shrine")
        .setDescription(description)
        .setFooter({text: `You have ${countFoxes(user.foxes)} foxes!`});
}

function getPurchaseSelector(tailCount) {
    let options = shrineData.map(p => new StringSelectMenuOptionBuilder()
        .setLabel(p.name)
        .setDescription(p.description)
        .setValue(`shrine.${p.value}`)
    );
    options = options.concat(new StringSelectMenuOptionBuilder()
        .setLabel(tailCount === 0 ? "?????????" : "Kitsune's Tail")
        .setDescription(tailCount === 0 ? "?????????" : "A blessing bestowed by the fluffy deities")
        .setValue("shrine.tail")
    );

    return new ActionRowBuilder()
        .addComponents(new StringSelectMenuBuilder()
            .setCustomId("shrinePurchase")
            .setPlaceholder("Select a shrine upgrade")
            .addOptions(...options)
        );
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
		.setDescription("Release foxes at the shrine for rewards!"),
    async stringSelect(user, values) {
        const upgrade = values[0].split('.')[1];
        const tailCount = (user.items ?? []).filter(i => i === "tail").length;

        let price = 1111 * (tailCount + 1);
        if (upgrade === "tail") {
            if (countFoxes(user.foxes) < price) {
                return {content: `You do not have enough foxes for ${tailCount === 0 ? "this" : "another tail"}... (${countFoxes(user.foxes)}/${price})`, embeds: [], components: []};
            }

            const userItems = user.items ?? [];
            let slot = userItems.findIndex(i => !i);
            if (slot === -1) { //if(findIndex fails)
                slot = userItems.length;
            }
            if (slot >= 9) {
                return {content: "You need a free item slot to acquire this!", embeds: [], components: []};
            }

            user.items ??= [];
            user.items[slot] = "tail";
            await user.save();
            return {content: `${tailMessages[tailCount]}`, embeds: [], components: []};
        }

        const purchase = shrineData.find(p => p.value === upgrade);
        price = getPrice(user, purchase);
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
            await user.save();
            return {content: `You got a ${purchase.emoji} **${purchase.name}**! (You now have **${user.upgrades.shrine[upgrade]}**)`, embeds: [], components: []};
        }
        else {
            return {content: `You do not have enough foxes for a ${purchase.emoji} **${purchase.name}**... (${countFoxes(user.foxes)}/${price})`, embeds: [], components: []};
        }
    },
	async execute(user) {
        const tailCount = (user.items ?? []).filter(i => i === "tail").length;
        return {embeds: [getShrineShopEmbed(user, tailCount)], components: [getPurchaseSelector(tailCount)]};
	}
};

