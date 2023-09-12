const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { items } = require('../../utilities/items.js');
const { effectData } = require('../../data/effectData.js');
const { getColor } = require('../../utilities/getColor.js');
const { tutorialData } = require('../../data/tutorialData.js');

function getItemEmbed(user) {
    let description = "";
    for (let i = 0; i < 9; ++i) {
        description = description.concat(`${i + 1}) ${user.items?.[i] ? `${items[user.items[i]].emoji} **${items[user.items[i]].name}**` : "*No Item*"}\n`);
    }

    return new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle("Your Items -")
        .setDescription(description);
}

function getItemSelector(user) {
    const userItems = user.items ?? {};
    let itemList = userItems.map((userItem, index) => {
        if (!userItem || userItem === "tail") {
            return undefined;
        }
        const item = items[userItem];
        return new StringSelectMenuOptionBuilder()
            .setLabel(item.name)
            .setDescription(item.description)
            .setValue(`items.${index}.${item.value}`);
    }).filter(i => i);

    return new ActionRowBuilder()
        .addComponents(new StringSelectMenuBuilder()
            .setCustomId("itemChoice")
            .setPlaceholder("Use an item!")
            .addOptions(...itemList)
        );
}

function getItemScreen(user, content) {
    return {content: (content ?? ""), embeds: [getItemEmbed(user)], components: (user.items ?? {}).filter(i => i && i !== "tail").length === 0 ? [] : [getItemSelector(user)]}
}


/* We have `items` as an argument when feeding into item functions so as to avoid circular dependencies */
module.exports = {
	data: new SlashCommandBuilder()
		.setName("items")
		.setDescription("View and use your items"),
    async buttonPress(user, customId) {
        return items[customId.split('.')[1]]?.buttonPress(user, getItemScreen, items, customId);
    },
    async stringSelect(user, values) {
        /* Pass-through if the interaction is for an item */
        const split = values[0].split('.');
        if (Object.keys(items).includes(split[1])) {
            return items[split[1]]?.stringSelect(user, getItemScreen, items, values);
        }

        /* Use item */
        const [itemsPrefix, slot, itemVal] = values[0].split('.');
        const item = items[itemVal];

        if (item.activeEffects) {
            user.equips ??= {};
            user.equips.activeEffects ??= [];
            for (const effect of item.activeEffects) {
                if ((user.equips.activeEffects.includes(effect) && !effectData[effect].isStackable)) {
                    const itemScreen = getItemScreen(user);
                    return {content: `You already have the **${effectData[effect].name}** effect active!`, embeds: itemScreen.embeds, components: itemScreen.components};
                }
            }
            item.activeEffects.forEach(effect => user.equips.activeEffects = user.equips.activeEffects.concat(effect));
        }
        if (itemVal !== "swap") { //Special case
            user.items ??= [];
            user.items[slot] = undefined;
        }

        user.stats ??= {};
        user.stats.itemsUsed = (user.stats.itemsUsed ?? 0) + 1;

        const output = await item.onUse(user, getItemScreen, items, parseInt(slot));
        await user.save();
        return output;
    },
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        await interaction.reply(getItemScreen(user));
	}
};

