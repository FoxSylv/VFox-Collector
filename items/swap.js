const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

function getItemSelector(user, items, slot) {
    const userItems = user.items ?? {}; 
    let itemList = userItems.map((userItem, index) => {
        if (!userItem || index === slot) {
            return undefined;
        }
        const item = items[userItem];
        return new StringSelectMenuOptionBuilder()
            .setLabel(item.name)
            .setDescription(item.description)
            .setValue(`${index}.${item.value}`);
    }).filter(i => i);

    return new ActionRowBuilder()
        .addComponents(new StringSelectMenuBuilder()
            .setCustomId("itemChoice")
            .setPlaceholder("Move an item!")
            .addOptions(...itemList)
        );  
}


module.exports = {
    emoji: ":inbox_tray:",
    name: "Swapper",
    value: "swap",
    description: "Moves another item into this slot",
    rarity: 6.5,
    weight: 2,
    async onUse(user, interaction, items, slot) {
        if (user.items.length === 1) {
            return "You did not have any items to swap";
        }

        const response = await interaction.reply({components: [getItemSelector(user, items, slot)]});
        try {
            const selection = await response.awaitMessageComponent({filter: i => i.user.id === interaction.user.id, time: 60000});
            const [itemSlot, itemVal] = selection.values[0].split('.');

            interaction.deleteReply();
            user.items[slot] = user.items[itemSlot];
            user.items[itemSlot] = undefined;
            return `You swapped the ${items[itemVal].name} to slot ${slot + 1}`;
        }
        catch(e) {
            interaction.deleteReply();
            return "";
        }
    }
}
