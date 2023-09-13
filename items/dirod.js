const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    emoji: ":magic_wand:",
    name: "Divining Rod",
    value: "dirod",
    description: "Determine the exact rarity of an item",
    rarity: 6,
    weight: 1,
    async stringSelect(user, getItemScreen, items, values) {
        const [prefix1, prefix2, slot, itemVal] = values[0].split('.');
        const item = items[itemVal];
        const rarity = (Math.floor((Math.random() + item.rarity + 4.5 - item.weight) * 10) / 10);
        return getItemScreen(user, `The ${item.emoji} **${item.name}** ${(item.rarity === -1000) ? "does not have a rarity! It can only be purchased!" : `has rarity **${rarity}**`}`);
    },
    async onUse(user, getItemScreen, items, slot) {
        const userItems = user.items.map((item, index) => {
            if (!item || (index === slot)) {
                return undefined;
            }
            return new StringSelectMenuOptionBuilder()
                .setLabel(items[item].name)
                .setDescription(items[item].description)
                .setValue(`items.dirod.${index}.${item}`)
        }).filter(i => i);

        const select = new ActionRowBuilder()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId("dirod-select")
                .setPlaceholder("Choose an item")
                .addOptions(...userItems)
            );
        return {content: "Select an item to divine", components: [select]};
    }
}
