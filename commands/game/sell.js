const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("sell")
		.setDescription("Sell foxes for coins!"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const oldFoxes = user.foxes ?? 0;
        const oldCoins = user.coins ?? 0;
        const newCoins = Math.max(Math.floor(oldFoxes / 100), oldCoins);

        if (newCoins === 0) {
            await interaction.reply("You need at least **100**:fox: foxes to start selling!");
            return;
        }
        else if (oldCoins === newCoins) {
            await interaction.reply(`Since you have **${oldCoins}**:coin:, you must sell at least **${(oldCoins + 1) * 100}**:fox: to get another coin :coin:!`);
            return;
        }

        const confirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Primary);

        const cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(confirm, cancel);

        const response = await interaction.reply({content: `Sell your foxes? :fox:\n \
This will remove your shrine upgrades, but will give you **${newCoins - oldCoins}**:coin: in return! (You currently have **${oldCoins}**:coin:)`, components: [row]});

        try {
            const confirmation = await response.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id, time: 60000 }); 
            if (confirmation.customId === "confirm") {
                user.stats ??= {};
                user.stats.foxesSold = (user.stats.foxesSold ?? 0) + (user.foxes ?? 0);

                user.foxes = 0;
                user.coins = newCoins;
                user.upgrades ??= {};
                user.upgrades.shrine = {};
                await user.save();
                await confirmation.update({content: `You have sold **${oldFoxes}**:fox: foxes for **${newCoins - oldCoins}**:coin:! (You now have **${newCoins}**:coin:)`, components: []});
            }
            else {
                await confirmation.update({content: 'The potential buyer walks away, looking disappointed.', components: []});
            }
        }
        catch (e) {
            await interaction.editReply({content: 'After waiting for a minute with no response, the potential buyer walks away.', components: [] }); 
        }
	}
};

