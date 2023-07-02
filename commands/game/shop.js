const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');

const shopPurchases = [
    {name: "Net Catalogue", value: "nets", emoji: "🪤", description: "Catch foxes better!", upgrades: [
        {name: "Shoddy Net", value: "shoddy", price: 1, flavor: "It beats using your hands"},
        {name: "Basic Net", value: "basic", price: 2, flavor: "Positively mediocre"},
        {name: "Extendo-Net", value: "extendo", price: 4, flavor: "Pros: Long range. Cons: Heavy"},
        {name: "Trawling Net", value: "trawling", price: 6, flavor: "Aren't these made for fishing?"},
        {name: "Glitter Net", value: "glitter", price: 7, flavor: "Made of pure(ish) gold"},
        {name: "Nine-tailed Net", value: "nine-tailed", price: 9, flavor: "Don't think too hard about it"}
    ]},
    {name: "Pen Catalogue", value: "pens", emoji: "🥅",description: "Store foxes better!", upgrades: [
        {name: "Basic Pen", value: "basic", price: 1, flavor: "Where were you keeping them before?"},
        {name: "Cramped Pen", value: "cramped", price: 3, flavor: "Don't call PETA"},
        {name: "Fox Park", value: "park", price: 3, flavor: "Go away, children!"},
        {name: "Fox Pit", value: "pit", price: 5, flavor: "Definitely don't call PETA"},
        {name: "Luxury Apartments", value: "apartment", price: 6, flavor: "Utilities included"},
        {name: "Nine-tailed Shrine", value: "shrine", price: 9, flavor: "I've been here before!"}
    ]},
    {name: "Land Catalogue", value: "land", emoji: "🌲", description: "Find better foxes!", upgrades: [
        {name: "Basic Land", value: "basic", price: 1, flavor: "I can see my house from here!"},
        {name: "Small Woods", value: "woods", price: 3, flavor: "There are a lot of foxes here"},
        {name: "Quaint Forest", value: "forest", price: 5, flavor: "Hasn't been touched in centuries"},
        {name: "Garbage Dump", value: "dump", price: 5, flavor: "You paid how much??"},
        {name: "Abundant Countryside", value: "countryside", price: 8, flavor: "There are way too many foxes here"},
        {name: "Blessed Land", value: "blessed", price: 9, flavor: "Nine-tailed Land"}
    ]},
    {name: "Bait Catalogue", value: "bait", emoji: "🍎", description: "Lure even more foxes with temporary bait!", upgrades: [
        {name: "Basic Bait", value: "basic", price: 2, quantity: 100, flavor: "C'mere foxy foxy foxy"},
        {name: "Special Bait", value: "special", price: 4, quantity: 200, flavor: "Special bait for special foxes!"},
        {name: "Advanced Bait", value: "advanced", price: 7, quantity: 50, flavor: "Hand-crafted with love"},
        {name: "Blessed Bait", value: "blessed", price: 9, quantity: 9, flavor: "Use sparingly"}
    ]},
    {name: "Item Catalogue", value: "items", emoji: "📦", description: "Get one-time use items!", upgrades: [
        {name: "Refund Voucher", value: "voucher", price: 1, quantity: 1, flavor: "This is a terrible deal"},
        {name: "Government Bribe", value: "bribe", price: 2, quantity: 1, flavor: "It's only illegal if you get caught"},
        {name: "Shrine Donation", value: "donation", price: 9, quantity: 1, flavor: "Take-a-fox Leave-a-fox"}
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



async function executePurchase(interaction, user, category, upgrade) {
    if ((user.upgrades?.coin?.[category.value]?.[upgrade.value] !== undefined) && (upgrade.quantity === undefined)) {
        await interaction.reply(`You already have the ${upgrade.name}!`);
        return;
    }

    const coins = user.coins ?? 0;
    if (coins < upgrade.price) {
        await interaction.reply(`You do not have enough :coin: for ${upgrade.name}! (You have ${coins}:coin: and need ${upgrade.price}:coin:!)`);
        return;
    }
    user.coins = coins - upgrade.price;

    if (category.value === "items") {
        await interaction.reply("ITEMS NOT YET IMPLEMENTED!!!!");
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
        await interaction.reply(`You purchased ${upgrade.quantity ? `${upgrade.quantity} ` : ``}${upgrade.name} for ${upgrade.price}:coin:!`);
    }

    await user.save();
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

