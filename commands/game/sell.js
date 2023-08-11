const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { countFoxes } = require('../../utilities/countFoxes.js');
const { foxData } = require('../../data/foxData.js');
const { getColor } = require('../../utilities/getColor.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("sell")
		.setDescription("Sell foxes for coins!"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const oldFoxes = countFoxes(user.foxes, true);
        const oldCoins = user.coins ?? 0;
        const newCoins = Math.max(Math.floor(oldFoxes / 100), oldCoins);
        const hasDonation = user.equips?.activeItems?.includes("donation");

        const description = foxData.reduce((acc, type) => {
            if ((user.foxes?.[type.value] ?? 0) !== 0) {
                return acc.concat(`**${user.foxes[type.value]}** ${type.emoji} -> **${user.foxes[type.value] * type.weight}** :fox:\n`);
            }
            return acc;
        }, "**Exchange Rates:**\n");
        let status;
        if (newCoins === 0) {status = "You need at least **100**:fox: foxes to start selling!";}
        else if (oldCoins === newCoins) {status = `Since you have **${oldCoins}**:coin:, you must sell at least **${(oldCoins + 1) * 100}**:fox: to get another coin :coin:!`;}
        else {status = `Since you have **${oldFoxes}**:fox: and **${oldCoins}**:coin:, selling now will give **${newCoins - oldCoins}**:coin:!`;}
        const sellEmbed = new EmbedBuilder()
            .setColor(getColor(user))
            .setTitle("Sell your foxes?")
            .setDescription(description)
            .addFields({name: '\u200b', value: '\u200b'},
                       {name: `This will reset${hasDonation ? "" : "your shrine upgrades and"} fox count`, value: status})
            .setFooter({text: `You have ${user.coins ?? 0}🪙`});

        const confirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(oldCoins === newCoins);
        const cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder()
            .addComponents(confirm, cancel);

        const response = await interaction.reply({embeds: [sellEmbed], components: [row]});
        try {
            const confirmation = await response.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id, time: 60000 }); 
            if (confirmation.customId === "confirm") {
                user.stats ??= {};
                user.stats.foxesSold = (user.stats.foxesSold ?? 0) + oldFoxes;

                user.foxes = {};
                user.coins = newCoins;
                user.upgrades ??= {};

                if (hasDonation) {
                    user.equips.activeItems = user.equips.activeItems.filter(i => i !== "donation");
                }
                else {
                    user.upgrades.shrine = {};
                }

                user.cooldown = undefined;
                await user.save();
                await confirmation.update({content: `You have sold **${oldFoxes}**:fox: foxes for **${newCoins - oldCoins}**:coin:! (You now have **${newCoins}**:coin:)`, embeds: [], components: []});
            }
            else {
                await confirmation.update({content: 'The potential buyer walks away, looking disappointed.', embeds: [], components: []});
            }
        }
        catch (e) {
            await interaction.editReply({content: 'After waiting for a minute with no response, the potential buyer walks away.', embeds: [], components: [] }); 
        }
	}
};

