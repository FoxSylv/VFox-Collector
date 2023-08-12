const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    emoji: ":wastebasket:",
    name: "Trash Can",
    value: "trash",
    description: "Removes unwanted items without using them",
    rarity: 0.5,
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
                .setCustomId("trash-select")
                .setPlaceholder("Select items to discard")
                .addOptions(...userItems)
                .setMinValues(0)
                .setMaxValues(userItems.length)
            );
        const noitem = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
                .setCustomId("noitems")
                .setLabel("No Items")
                .setStyle(ButtonStyle.Danger)
            );
        const selection = await interaction.reply({content: "Select items to throw out", components: [select, noitem]});
        const response = await selection.awaitMessageComponent({filter: i => i.user.id === interaction.user.id, time: 60000});

        interaction.deleteReply();
        if (response.customId === "noitems") {
            return "You discarded no extra items";
        }
        response.values.forEach(i => user.items[i] = undefined);
        return `You discarded ${response.values.length} item${response.values.length === 1 ? "" : "s"}`;
    }
}
