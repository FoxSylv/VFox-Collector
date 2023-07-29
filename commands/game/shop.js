const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { msToSec } = require('../../utilities/msToSec.js');

function getShopEmbed(user, currentLocation) {
    let description;
    currentLocation ??= "back";
    if (currentLocation === "back") {
        description = shopData.reduce((acc, category) => {
            return acc.concat(`• ${category.emoji} **${category.name}**: ${category.description}\n`);
        }, "");
    }
    else {
        const category = shopData.find(c => c.value === currentLocation);
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
})].concat(shopData.map(category => new ButtonBuilder({
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



function getUpgradePower(power) {
    switch (power) {
        case -4:
            return "Absurdly decreases";
        case -2:
            return "Drastically decreases";
        case -1:
            return "Decreases";
        case -0.5:
            return "Marginally decreases";
        case 0.5:
            return "Marginally increases";
        case 1:
            return "Increases";
        case 2:
            return "Drastically increases";
        case 4:
            return "Absurdly increases";
        default:
            return "Does not change";
    }
}
const upgradeText = {
    foxQuantity: {name: "fox quantity"},
    foxQuality: {name: "fox quality", generic: "rare foxes"},
    itemQuantity: {name: "item quantity", generic: "items"},
    itemQuality: {name: "item quality"},
    kitsune: {name: "the chance to find kitsunes specficially", generic: "kitsunes"}
};
function getUpgradeDescription(upgrade) {
    return (upgrade.quantity ? `**${upgrade.quantity}-TIME USE**\n` : `**PERMANENT PURCHASE**\n`).concat(Object.keys(upgrade).reduce((acc, key) => {
        switch (key) {
            case "name":
            case "value":
            case "price":
            case "flavor":
            case "quantity":
            case "minionChance":
                return acc;
            case "chance":
                return acc.concat(`Boosts your fox-finding chance by ${upgrade[key]}\n`);
            case "cooldown":
                return acc.concat(`Sets your minimum cooldown to ${msToSec(upgrade[key])}\n`);
            case "max":
                return acc.concat(`Sets your maximum pen capacity to ${upgrade[key]}\n`);
            case "penalty":
                return acc.concat(`Sets your overpopulation penalty to ${msToSec(upgrade[key])} per fox\n`);
            case "extra":
                return acc.concat(`${upgrade[key]}\n`);
            default:
                return acc.concat(upgrade[key] === -1000 ? `You cannot find ${upgradeText[key].generic} with this equipped!\n` : `${getUpgradePower(upgrade[key])} ${upgradeText[key].name}\n`);
        }
    }, ""));
}
function getUpgradeMessage(user, category, upgrade) {
    const embed = new EmbedBuilder()
        .setColor(0xEA580C)
        .setTitle(`${category.emoji} - ${upgrade.name}`)
        .setDescription(getUpgradeDescription(upgrade))
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
            await confirmation.update({content: `You purchased ${upgrade.quantity ? `${upgrade.quantity} ` : ``}${upgrade.name} for **${upgrade.price}**:coin:!`, embeds: [], components: []});
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
                  .addChoices(...shopData.flatMap(c => c.upgrades.map(p => JSON.parse(`{"name": "${p.name}", "value": "${c.value + '.' + p.value}"}`))))
        ),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const upgrade = interaction.options.getString("upgrade");
        if (upgrade) {
            const split = upgrade.split('.');
            const category = shopData.find(c => c.value === split[0]);
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

