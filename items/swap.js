const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

function getItemSelector(user, items, slot) {
    }


module.exports = {
    emoji: ":inbox_tray:",
    name: "Swapper",
    value: "swap",
    description: "Moves another item into this slot",
    rarity: 6.5,
    weight: 2,
    overridesDelete: true,
    async stringSelect(user, getItemScreen, items, values) {
        const [prefix1, prefix2, swapSlot, itemSlot, itemVal] = values[0].split('.');
        user.items[swapSlot] = user.items[itemSlot];
        user.items[itemSlot] = undefined;
        await user.save();
        return getItemScreen(user, `You swapped the ${items[itemVal].emoji} **${items[itemVal].name}** to slot **${parseInt(swapSlot) + 1}**`);
    },
    async onUse(user, getItemScreen, items, slot) {
        const userItems = user.items ?? {}; 
        const itemList = userItems.map((userItem, index) => {
            if (!userItem || index === slot) {
                return undefined;
            }
            const item = items[userItem];
            return new StringSelectMenuOptionBuilder()
                .setLabel(item.name)
                .setDescription(item.description)
                .setValue(`items.swap.${slot}.${index}.${item.value}`);
        }).filter(i => i);
        if (itemList.length === 0) {
            return getItemScreen(user, "You have no items to swap");
        }

        const row = new ActionRowBuilder()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId("itemChoice")
                .setPlaceholder("Move an item!")
                .addOptions(...itemList)
            );
        return {content: `Select an item to move to slot **${slot + 1}**`, components: [row]};
    }
}
