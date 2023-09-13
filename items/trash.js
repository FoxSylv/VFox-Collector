const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    emoji: ":wastebasket:",
    name: "Trash Can",
    value: "trash",
    description: "Removes unwanted items without using them",
    rarity: 0.5,
    weight: 5,
    async buttonPress(user, getItemScreen) {
        /* The only button is the "No Items" button */
        return getItemScreen(user, "You did not trash anything");
    },
    async stringSelect(user, getItemScreen, items, values) {
        values.forEach(v => user.items[v.split('.')[2]] = undefined);
        await user.save();
        return getItemScreen(user, `You trashed ${(values.length === 1) ? `your ${items[values[0].split('.')[3]].emoji} **${items[values[0].split('.')[3]].name}**` : `**${values.length} items**`}`);
    },
    async onUse(user, getItemScreen, items, slot) {
        const userItems = user.items.map((item, index) => {
            if (!item || (index === slot)) {
                return undefined;
            }
            return new StringSelectMenuOptionBuilder()
                .setLabel(items[item].name)
                .setDescription(items[item].description)
                .setValue(`items.trash.${index}.${item}`)
        }).filter(i => i);

        const select = new ActionRowBuilder()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId("items.trash.selection")
                .setPlaceholder("Select items to discard")
                .addOptions(...userItems)
                .setMinValues(0)
                .setMaxValues(userItems.length)
            );
        const noitem = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
                .setCustomId("items.trash.noitems")
                .setLabel("No Items")
                .setStyle(ButtonStyle.Danger)
            );

        if (userItems.length === 0) {
            return getItemScreen(user, "You did not have any items to trash");
        }
        return {content: "Select items to throw out", components: [select, noitem]};
    }
}
