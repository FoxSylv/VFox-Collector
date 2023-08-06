const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { items } = require('../../utilities/items.js');

function getItemEmbed(user) {
    let description = "";
    for (let i = 0; i < 9; ++i) {
        description = description.concat(`${i + 1}) ${user.items?.[i] ? `${items[user.items[i]].emoji} **${items[user.items[i]].name}**` : "*No Item*"}\n`);
    }

    return new EmbedBuilder()
        .setColor(0xEA580C)
        .setTitle("Your Items -")
        .setDescription(description);
}

function getItemSelector(user) {
    const userItems = user.items ?? {};
    let itemList = userItems.map((userItem, index) => {
        if (!userItem) {
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
            .setPlaceholder("Use an item!")
            .addOptions(...itemList)
        );
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName("items")
		.setDescription("View and use your items"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);

        const response = await interaction.reply({embeds: [getItemEmbed(user)], components: (user.items ?? {}).filter(i => i).length === 0 ? [] : [getItemSelector(user)]});
        try {
            const selection = await response.awaitMessageComponent({filter: i => i.user.id === interaction.user.id, time: 60000});
            const [slot, itemVal] = selection.values[0].split('.');
            const item = items[itemVal];
            const useMessage = await item.onUse(user);
            user.items ??= {};
            user.items[slot] = undefined;
            await user.save();
            await interaction.editReply({content: `You used the ${item.emoji} **${item.name}**! ${useMessage}`, embeds: [], components: []});
        }
        catch(e) {
            await interaction.editReply({components: []});
        }
	}
};

