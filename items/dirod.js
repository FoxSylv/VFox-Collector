const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    emoji: ":magic_wand:",
    name: "Divining Rod",
    value: "dirod",
    description: "Determine the exact rarity of an item",
    rarity: 6,
    weight: 1,
    async onUse(user, interaction, items, slot) {
        const userItems = user.items.map((item, index) => {
            if (!item || (index === slot)) {
                return undefined;
            }
            return new StringSelectMenuOptionBuilder()
                .setLabel(items[item].name)
                .setDescription(items[item].description)
                .setValue(index.toString())
        }).filter(i => i);

        const select = new ActionRowBuilder()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId("dirod-select")
                .setPlaceholder("Choose an item")
                .addOptions(...userItems)
            );
        const selection = await interaction.reply({content: "Select an item to divine", components: [select]});
        const response = await selection.awaitMessageComponent({filter: i => i.user.id === interaction.user.id, time: 60000});

        interaction.deleteReply();
        const item = items[user.items[response.values[0]]];

        if (item.rarity === -1000) {
            return `The ${item.emoji} ${item.name} does not have a rarity! It can only be purchased!`;
        }
        return `The ${item.emoji} ${item.name} has rarity ${item.rarity}`;
    }
}
