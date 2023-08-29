const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { msToSec } = require('../../utilities/msToSec.js');
const { items } = require('../../utilities/items.js');
const { getColor } = require('../../utilities/getColor.js');

function getShopEmbed(user, currentLocation) {
    let description;
    currentLocation ??= "back";
    if (currentLocation === "back") {
        description = shopData.reduce((acc, category) => {
            return acc.concat(`${category.emoji} **${category.name}**: ${category.description}\n`);
        }, "");
    }
    else {
        const category = shopData.find(c => c.value === currentLocation);
        description = category.upgrades.reduce((acc, upgrade) => {
            let price = `${upgrade.price}:coin:`;
            if (user.upgrades?.coin?.[category.value]?.[upgrade.value] === true) {
                price = ":white_check_mark:";
            }
            if (user.equips?.[category.value] === upgrade.value) {
                price = ":ballot_box_with_check:";
            }
            return acc.concat(`• **${upgrade.name}** (${price}): ${upgrade.minidesc}\n`);
        }, "");
    }
    
    return new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle(`The Shop${currentLocation === "back" ? "": ` - ${currentLocation.charAt(0).toUpperCase().concat(currentLocation.slice(1))}`}`)
        .setDescription(description)
        .setFooter({text: `You have ${user.coins ?? 0} coin${user.coins === 1 ? "" : "s"}`});
}


const buttons = [new ButtonBuilder({
    custom_id: "back",
    style: ButtonStyle.Secondary,
    label: "Back"
})].concat(shopData.map(category => new ButtonBuilder({
    custom_id: category.value,
    style: ButtonStyle.Primary,
    label: `${category.value.charAt(0).toUpperCase().concat(category.value.slice(1))}`,
    emoji: {name: category.emoji}
})));
function getNavbar(currentLocation) {
    const usedButtons = buttons.filter(b => b.data.custom_id !== currentLocation);
    return new ActionRowBuilder({components: usedButtons});
}

function getCatalogueSelector(categoryValue) {
    const category = shopData.find(c => c.value === categoryValue);
    return new ActionRowBuilder()
        .addComponents(new StringSelectMenuBuilder()
            .setCustomId("shopSelect")
            .setPlaceholder("View a shop upgrade")
            .addOptions(...category.upgrades.map(upgrade => new StringSelectMenuOptionBuilder()
                .setLabel(upgrade.name)
                .setDescription(upgrade.minidesc)
                .setValue(`${category.value}.${upgrade.value}`)
            ))
        );
}

function getShopMessage(user, currentLocation) {
    currentLocation ??= "back";
    const comps = currentLocation === "back" ? [getNavbar(currentLocation)] : [getCatalogueSelector(currentLocation), getNavbar(currentLocation)];
    return {embeds: [getShopEmbed(user, currentLocation)], components: comps};
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
        case 8:
            return "Ludicrously increases";
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
            case "emoji":
            case "minidesc":
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
    const isOwned = (user.upgrades?.coin?.[category.value]?.[upgrade.value] !== undefined) && (upgrade.quantity === undefined);
    const isEquipped = user.equips?.[category.value] === upgrade.value;
    const embed = new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle(`${category.emoji} - ${upgrade.name}`)
        .setDescription(getUpgradeDescription(upgrade))
        .addFields({name: '\u200b', value: '\u200b'},
                   {name: `Price: **${upgrade.price}**:coin:`, value: `You have: **${user.coins ?? 0}**:coin:`})
        .setFooter({text: upgrade.flavor});

    let buttons = [new ButtonBuilder()
            .setCustomId(isOwned ? (isEquipped ? "unequip" : "equip") : "purchase")
            .setLabel(isOwned ? (isEquipped ? "Unequip" : "Equip") : "Purchase")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(((user.coins ?? 0) < upgrade.price) && !isOwned),
        new ButtonBuilder()
            .setCustomId(category.value)
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary)
    ];
    if (category.value === "bait") {
        const baitCount = user.upgrades?.coin?.bait?.[upgrade.value] ?? 0;
        buttons.splice(1, 0, new ButtonBuilder()
            .setCustomId(isEquipped ? "unequip" : "equip")
            .setLabel(`${isEquipped ? "Unequip" : "Equip"} (${baitCount})`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(baitCount <= 0)
        );
    }

    const actionRow = new ActionRowBuilder().addComponents(...buttons);
    return {embeds: [embed], components: [actionRow]};
}

async function executePurchase(interaction, user, category, upgrade) {
    console.log(interaction);
    const response = await interaction.reply(getUpgradeMessage(user, category, upgrade));
    try {
	    const confirmation = await response.awaitMessageComponent({filter: i => i.user.id === interaction.user.id, time: 60000});
        if (confirmation.customId === "equip") {
            user.equips ??= {};
            user.equips[category.value] = upgrade.value;
            await user.save();
            await confirmation.update({content: `${category.value === "items" ? "" : "The "}${upgrade.name} was equipped!`, embeds: [], components: []});
            return;
        }
        else if (confirmation.customId === "unequip") {
            user.equips ??= {};
            user.equips[category.value] = undefined;
            await user.save();
            await confirmation.update({content: `${category.value === "items" ? "" : "The "}${upgrade.name} was unequipped!`, embeds: [], components: []});
            return;
        }
        else if(confirmation.customId === "purchase") {
            if (category.value === "items") {
                const userItems = user.items ?? [];
                let slot = userItems.findIndex(i => !i);
                if (slot === -1) { //if(findIndex fails)
                    slot = userItems.length;
                }
                if (slot >= 9) {
                    await confirmation.update({content: "You do not have any free item slots!", embeds: [], components: []});
                    return;
                }
                const item = items[upgrade.value];
                await confirmation.update({content: `You purchased a ${item.emoji} ${item.name}! It has gone into slot ${slot + 1}`, embeds: [], components: []});
                userItems[slot] = item.value;
                user.items = userItems;
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
        
                user.equips ??= {};
                user.equips[category.value] = upgrade.value;
                await confirmation.update({content: `You purchased ${upgrade.quantity ? `${upgrade.quantity} ` : ``}${upgrade.name} for **${upgrade.price}**:coin:!\nIt has automatically been equipped`, embeds: [], components: []});
            }
        
            user.coins = (user.coins ?? 0) - upgrade.price;
            user.stats ??= {};
            user.stats.shopPurchases = (user.stats.shopPurchases ?? 0) + 1;
            await user.save();
        }
    }
    catch (e) {
        await interaction.editReply({components: []});
    }
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName("shop")
		.setDescription("Purchase permanent upgrades!"),
    buttonValues: ["back"].concat(shopData.map(c => c.value)),
    async buttonPress(user, customId) {
        return getShopMessage(user, customId);
    },
    stringSelectValues: shopData.flatMap(c => c.upgrades.map(u => `${c.value}.${u.value}`)),
    async stringSelect(interaction, user, customId) {
        const [categoryValue, upgradeValue] = customId.split('.');
        const category = shopData.find(c => c.value === categoryValue);
        await executePurchase(interaction, user, category, category.upgrades.find(u => u.value === upgradeValue));
    },
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        await interaction.reply(getShopMessage(user));
	}
};

