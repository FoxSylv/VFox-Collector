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
        const item = items[userItem];
        return new StringSelectMenuOptionBuilder()
            .setLabel(item.name)
            .setDescription(item.description)
            .setValue(`${index}.${item.value}`);
    });
    if (itemList.length === 0) {
        return new ActionRowBuilder()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId("noItems")
                .setPlaceholder("You have no items!")
                .addOptions(new StringSelectMenuOptionBuilder()
                    .setLabel("You have no items!")
                    .setDescription("You have no items!")
                    .setValue("noItems")
                )
            );
    }

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
        await interaction.reply({embeds: [getItemEmbed(user)], components: [getItemSelector(user)]});
	}
};

