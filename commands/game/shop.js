const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');

const shopPurchases = [
    {name: "Net Catalogue", value: "nets", emoji: "🪤", description: "Catch foxes better!", upgrades: [
        {name: "Shoddy Net", value: "shoddy", price: 1, flavor: "It beats using your hands", description: "**PERMANENT PURCHASE**\n\nSets your fox-finding chance to 0.98\n(The default fox-finding chance is 0.97)\nAllows you to find items, even if this net is not equipped"},
        {name: "Basic Net", value: "basic", price: 2, flavor: "Positively mediocre", description: "**PERMANENT PURCHASE**\n\nSets your fox-finding chance to 0.988\nMarginally increases quantity of found foxes\nAllows you to catch rare foxes, even if this net is not equipped"},
        {name: "Extendo-Net", value: "extendo", price: 4, flavor: "Pros: Long range. Cons: Heavy", description: "**PERMANENT PURCHASE**\n\nSets your fox-finding chance to 0.991\nSlightly increases the quantity of found foxes\nSlightly reduces the average fox rarity"},
        {name: "Trawling Net", value: "trawling", price: 6, flavor: "Aren't these made for fishing?", description: "**PERMANENT PURCHASE**\n\nSets your fox-finding chance to 0.993\nDrastically increases quantity of found foxes\nDrastically reduces the quantity and quality of found items\nYou cannot find rare foxes with this net"},
        {name: "Glitter Net", value: "glitter", price: 7, flavor: "Made of pure(ish) gold", description: "**PERMANENT PURCHASE**\n\nSets your fox-finding chance to 0.95\n(Default fox-finding chance is 0.97)\nDrastically increases quantity and quality of found items\nDrastically increases the average fox rarity\nReduces the quantity of found foxes"},
        {name: "Nine-tailed Net", value: "nine-tailed", price: 9, flavor: "Don't think too hard about it", description: "**PERMANENT PURCHASE**\n\nSets your fox-finding chance to 0.999\nDrastically increases both the quantity and quality of foxes found\nYou cannot find items with this net\nAllows you to catch kitsunes, even if this net is not equipped"}
    ]},
    {name: "Pen Catalogue", value: "pens", emoji: "🥅",description: "Store foxes better!", upgrades: [
        {name: "Basic Pen", value: "basic", price: 1, flavor: "Where were you keeping them before?", description: "**PERMANENT PURCHASE**\n\nSets your minimum cooldown to 4.2 seconds\n(Default minimum cooldown is 5.1 seconds)\nSets maximum capacity to 120 foxes\n(Default maximum capacity is 60 foxes)\nSets your overpopulation penalty to 0.2 seconds per fox\n(Default overpopulation penalty is 0.3 seconds per fox)"},
        {name: "Cramped Pen", value: "cramped", price: 3, flavor: "Don't call PETA", description: "**PERMANENT PURCHASE**\n\nSets your minimum cooldown to 5.6 seconds\nSets maximum capacity to 350 foxes\nSets your overpopulation penalty to 0.15 seconds per fox\nReduces the chance to find rare foxes"},
        {name: "Fox Park", value: "park", price: 3, flavor: "Go away, children!", description: "**PERMANENT PURCHASE**\n\nSets your minimum cooldown to 7.4 seconds\nSets maximum capacity to 150 foxes\nSets your overpopulation penalty to 0.25 seconds per fox\nIncreases the chance to find rare foxes\nMarginally increases the chance to find items"},
        {name: "Fox Pit", value: "pit", price: 5, flavor: "Definitely don't call PETA", description: "**PERMANENT PURCHASE**\n\nSets your minimum cooldown to 18.2 seconds\nSets maximum capacity to 750 foxes\nSets your overpopulation penalty to 0.1 seconds per fox\nYou cannot find items with this pen\nYou cannot find rare foxes with this pen"},
        {name: "Luxury Apartments", value: "apartment", price: 6, flavor: "Utilities included", description: "**PERMANENT PURCHASE**\n\nSets your minimum cooldown to 34.6 seconds\nSets maximum capacity to 400 foxes\nSets your overpopulation penalty to 0.2 seconds\nDrastically increases the chance to find rare foxes\nMarginally reduces the chance to find items"},
        {name: "Nine-tailed Shrine", value: "shrine", price: 9, flavor: "I've been here before!", description: "**PERMANENT PURCHASE**\n\nSets your minimum cooldown to 9.0 seconds\nThe maximum capacity is the average price in foxes of the shrine upgrades\nThe overpopulation penalty is 0.09 seconds\nDrastically increases both the quantity and quality of found foxes\nYou cannot find items with this pen\nAllows you catch kitsunes, even if this pen is not equipped"}
    ]},
    {name: "Land Catalogue", value: "land", emoji: "🌲", description: "Find better foxes!", upgrades: [
        {name: "Basic Land", value: "basic", price: 1, flavor: "I can see my house from here!", description: "**PERMANENT PURCHASE**\n\nIncreases the quantity of found foxes\nMarginally increases the odds to find rare foxes\nMarginally increases the odds to find items"},
        {name: "Small Woods", value: "woods", price: 3, flavor: "There are a lot of foxes here", description: "**PERMANENT PURCHASE**\n\nDrastically increases the quantity and quality of found foxes\nIncreases the quantity of found items"},
        {name: "Quaint Forest", value: "forest", price: 5, flavor: "Hasn't been touched in centuries", description: "**PERMANENT PURCHASE**\n\nAbsurdly increases the quantity of found foxes\nMarginally increases the odds to find rare foxes\nDecreases the quality and quantity of found items"},
        {name: "Garbage Dump", value: "dump", price: 5, flavor: "You paid how much??", description: "**PERMANENT PURCHASE**\n\nAbsurdly increases the quantity of items found\nDrastically increases the quality of found items\nAbsurdly decreases the quality and quantity of found foxes"},
        {name: "Abundant Countryside", value: "countryside", price: 8, flavor: "There are way too many foxes here", description: "**PERMANENT PURCHASE**\n\nAbsurdly increases the quantity of found foxes\nDrastically increases the odds to find rare foxes\nMarginally increases fox-finding chance\nDrastically increases item quantity\nIncreases item quality"},
        {name: "Blessed Land", value: "blessed", price: 9, flavor: "Nine-tailed Land", description: "**PERMANENT PURCHASE**\n\nAbsurdly increases the quantity and quality of found foxes\nIncreases the odds of finding kitsunes specifically\nMarginally increases fox-finding chance\nYou cannot find items with this land\nAllows you to catch kitsunes, even if this land is not equipped"}
    ]},
    {name: "Bait Catalogue", value: "bait", emoji: "🍎", description: "Lure even more foxes with temporary bait!", upgrades: [
        {name: "Basic Bait", value: "basic", price: 2, quantity: 100, flavor: "C'mere foxy foxy foxy", description: "**100-TIME USE**\n\nMarginally increases fox-finding chance\nIncreases the quantity of found foxes"},
        {name: "Special Bait", value: "special", price: 4, quantity: 200, flavor: "Special bait for special foxes!", description: "**200-TIME USE**\n\nMarginally increases fox-finding chance\nAbsurdly increases the quantity and quality of found foxes\nReduces the odds of finding items"},
        {name: "Advanced Bait", value: "advanced", price: 7, quantity: 50, flavor: "Hand-crafted with love", description: "**50-TIME USE**\n\nIncreases fox-finding chance\nAbsurdly increases the odds to find rare foxes\nDrastically increases quantity of foxes found"},
        {name: "Blessed Bait", value: "blessed", price: 9, quantity: 9, flavor: "Use sparingly", description: "**9-TIME USE**\n\nAbsurdly increases fox-finding chance\nAbsurdly increases the quantity and quality of found foxes\nIncreases the odds of finding kitsunes specifically\nYou cannot find items with this bait"}
    ]},
    {name: "Item Catalogue", value: "items", emoji: "📦", description: "Get one-time use items!", upgrades: [
        {name: "Refund Voucher", value: "voucher", price: 1, quantity: 1, flavor: "This is a terrible deal", description: "**ONE-TIME USE**\n\nInstantly gain fifteen foxes!\nRare foxes not included"},
        {name: "Government Bribe", value: "bribe", price: 1, quantity: 1, flavor: "It's only illegal if you get caught", description: "**ONE-TIME USE**\n\nSets your fox count to zero while preserving shrine upgrades\nYou do not gain any coins from this"},
        {name: "Shrine Donation", value: "donation", price: 9, quantity: 1, flavor: "Take-a-fox Leave-a-fox", description: "**ONE-TIME USE**\n\nPreserves shrine upgrades next time you sell foxes\nThis is the only way to get coins while maintaining shrine upgrades"}
    ]}
];

function getShopEmbed(user, currentLocation) {
    let description;
    currentLocation ??= "back";
    if (currentLocation === "back") {
        description = shopPurchases.reduce((acc, category) => {
            return acc.concat(`• ${category.emoji} **${category.name}**: ${category.description}\n`);
        }, "");
    }
    else {
        const category = shopPurchases.find(c => c.value === currentLocation);
        description = category.upgrades.reduce((acc, upgrade) => {
            const price = user.upgrades?.coin?.[category.value]?.[upgrade.value] === true ? `:white_check_mark:` : `${upgrade.price}:coin:`;
            return acc.concat(`• **${upgrade.name}** (${price}): ${upgrade.flavor}\n`);
        }, "");
    }
    
    return new EmbedBuilder()
        .setColor(0xEA580C)
        .setTitle(`The Shop${currentLocation === "back" ? "": ` - ${currentLocation.charAt(0).toUpperCase().concat(currentLocation.slice(1))}`}`)
        .setDescription(description)
        .setFooter({text: `You have ${user.coins ?? 0}🪙`});
}

const buttons = [new ButtonBuilder({
    custom_id: "back",
    style: ButtonStyle.Secondary,
    label: "⬅️ Back"
})].concat(shopPurchases.map(category => new ButtonBuilder({
    custom_id: category.value,
    style: ButtonStyle.Primary,
    label: `${category.emoji} ${category.value.charAt(0).toUpperCase().concat(category.value.slice(1))}`
})));
function getActionRow(currentLocation) {
    currentLocation ??= "back";
    const usedButtons = buttons.filter(b => b.data.custom_id !== currentLocation);
    return new ActionRowBuilder({components: usedButtons});
}

function getShopMessage(user, currentLocation) {
    return {embeds: [getShopEmbed(user, currentLocation)], components: [getActionRow(currentLocation)]};
}



function getUpgradeMessage(user, category, upgrade) {
    const embed = new EmbedBuilder()
        .setColor(0xEA580C)
        .setTitle(`${category.emoji} - ${upgrade.name}`)
        .setDescription(`${upgrade.description}`)
        .addFields({name: '\u200b', value: '\u200b'},
                   {name: `Price: **${upgrade.price}**:coin:`, value: `You have: **${user.coins ?? 0}**:coin:`})
        .setFooter({text: upgrade.flavor});

    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("purchase")
            .setLabel("Purchase")
            .setStyle(ButtonStyle.Primary)
            .setDisabled((user.coins ?? 0) < upgrade.price),
        new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary)
    );

    return {embeds: [embed], components: [actionRow]};
}

async function executePurchase(interaction, user, category, upgrade) {
    if ((user.upgrades?.coin?.[category.value]?.[upgrade.value] !== undefined) && (upgrade.quantity === undefined)) {
        await interaction.reply(`You already have the ${upgrade.name}!`);
        return;
    }
    
    const response = await interaction.reply(getUpgradeMessage(user, category, upgrade));
    try {
	    const confirmation = await response.awaitMessageComponent({filter: i => i.user.id === interaction.user.id, time: 60000});
        if (confirmation.customId === "cancel") {
            await confirmation.update({content: "Purchase cancelled!", embeds: [], components: []});
            return;
        }

        if (category.value === "items") {
            await confirmation.update({content: "ITEMS NOT YET IMPLEMENTED!!!!", embeds: [], components: []});
        }
        else {
            user.upgrades ??= {};
            user.upgrades.coin ??= {};
            user.upgrades.coin[category.value] ??= {};
            const oldValue = user.upgrades.coin[category.value][upgrade.value];
            if (upgrade.quantity) {
                user.upgrades.coin[category.value][upgrade.value] = (oldValue ?? 0) + upgrade.quantity;
            }
            else {
                user.upgrades.coin[category.value][upgrade.value] = true;
            }

            user.coins = (user.coins ?? 0) - upgrade.price;
            await confirmation.update({content: `You purchased ${upgrade.quantity ? `${upgrade.quantity} ` : ``}${upgrade.name} for ${upgrade.price}:coin:!`, embeds: [], components: []});
        }
    
        await user.save();
    }
    catch (e) {
        await interaction.editReply({components: []});
    }
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName("shop")
		.setDescription("Purchase permanent upgrades!")
        .addStringOption(option =>
            option.setName("upgrade")
                  .setDescription("The upgrade to buy")
                  .addChoices(...shopPurchases.flatMap(c => c.upgrades.map(p => JSON.parse(`{"name": "${p.name}", "value": "${c.value + '.' + p.value}"}`))))
        ),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const upgrade = interaction.options.getString("upgrade");
        if (upgrade) {
            const split = upgrade.split('.');
            const category = shopPurchases.find(c => c.value === split[0]);
            const upgradeData = category.upgrades.find(u => u.value === split[1]);
            await executePurchase(interaction, user, category, upgradeData);
            return;
        }

        
        /* If nothing is purchased, display entire shop */
        let response = await interaction.reply(getShopMessage(user));
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.ButtonInteraction, time: 3_600_000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return;
            await i.reply(getShopMessage(user, i.customId));
        });
	}
};

