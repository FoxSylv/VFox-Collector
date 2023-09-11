const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { countFoxes } = require('../../utilities/countFoxes.js');
const { foxData } = require('../../data/foxData.js');
const { getColor } = require('../../utilities/getColor.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("sell")
		.setDescription("Sell foxes for coins!"),
    async buttonPress(user, customId) {
        if (customId === "sell.confirm") {
            const oldFoxes = countFoxes(user.foxes, true);
            const oldCoins = user.coins ?? 0;
            const newCoins = Math.max(Math.floor(oldFoxes / 100), oldCoins);
            const hasDonation = user.equips?.activeEffects?.includes("donation");
        
            user.stats ??= {};
            user.stats.foxesSold ??= {};
            foxData.forEach(type => {
                if ((user.foxes[type.value] ?? 0) !== 0) {
                    user.stats.foxesSold[type.value] = (user.stats.foxesSold[type.value] ?? 0) + user.foxes[type.value];
                }
            });

            user.foxes = {};
            user.counter = 0;
            user.coins = newCoins;
            user.upgrades ??= {};

            if (hasDonation) {
                user.equips.activeEffects = user.equips.activeEffects.filter(i => i !== "donation");
            }
            else {
                user.upgrades.shrine = {};
            }

            user.cooldown = undefined;
            return {content: `You have sold **${oldFoxes}**:fox: foxes for **${newCoins - oldCoins}**:coin:! (You now have **${newCoins}**:coin:)`, embeds: [], components: []};
            await user.save();
        }
        else {
            return {content: "Selling cancelled!", embeds: [], components: []}
        }
    },
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const oldFoxes = countFoxes(user.foxes, true);
        const oldCoins = user.coins ?? 0;
        const newCoins = Math.max(Math.floor(oldFoxes / 100), oldCoins);
        const hasDonation = user.equips?.activeEffects?.includes("donation");

        const description = foxData.reduce((acc, type) => {
            if ((user.foxes?.[type.value] ?? 0) !== 0) {
                return acc.concat(`**${user.foxes[type.value]}** ${type.emoji} -> **${user.foxes[type.value] * type.weight}** :fox:\n`);
            }
            return acc;
        }, "**Exchange Rates:**\n");

        let status;
        if (newCoins === 0) {status = "You need at least **100**:fox: foxes to start selling!";}
        else if (oldCoins === newCoins) {status = `Since you have **${oldCoins}**:coin:, you must sell at least **${(oldCoins + 1) * 100}**:fox: to get another coin :coin:!
As you use your coins, this fox requirement will revert back to **100**:fox:`;}
        else if (oldCoins === 0) {status = `Since you have **${oldFoxes}**:fox:, selling now will give **${newCoins}**:coin:!`}
        else {status = `Since you have **${oldFoxes}**:fox: and **${oldCoins}**:coin:, selling now will give **${newCoins - oldCoins}**:coin:!
You can sell for up to **${newCoins}**:coin: if you use all of your current coins`;}

        const sellEmbed = new EmbedBuilder()
            .setColor(getColor(user))
            .setTitle("Sell your foxes?")
            .setDescription(description)
            .addFields({name: '\u200b', value: '\u200b'},
                       {name: `This will reset your${hasDonation ? "" : " shrine upgrades and"} fox count`, value: status})
            .setFooter({text: `You have ${user.coins ?? 0} coin${user.coins === 1 ? "" : "s"}`});

        const confirm = new ButtonBuilder()
            .setCustomId("sell.confirm")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(oldCoins === newCoins);
        const cancel = new ButtonBuilder()
            .setCustomId("sell.cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder()
            .addComponents(confirm, cancel);

        await interaction.reply({embeds: [sellEmbed], components: [row]});
	}
};

