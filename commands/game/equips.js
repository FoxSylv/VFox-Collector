const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { effectData } = require('../../data/effectData.js');
const { items } = require('../../utilities/items.js');
const { getColor } = require('../../utilities/getColor.js');

function getEmbedDescription(user) {
    //Equipped items
    let description = shopData.reduce((acc, category) => {
        const upgrade = category.upgrades.find(u => u.value === user.equips?.[category.value]);
        return acc.concat(upgrade ? `${category.emoji} - ${upgrade.name}\n` : "");
    }, "");
    if (description === "") {
        description = "You do not have anything equipped!\n"
    }

    //Active Effects
    description = description.concat("\n**Active Effects -**\n");
    const tailCount = (user.items ?? []).filter(i => i === "tail").length;
    if ((user.equips?.activeEffects === undefined || user.equips?.activeEffects?.length === 0) && tailCount === 0) {
        description = description.concat("You have no active effects!");
    }
    else {
        if (tailCount >= 9) {
            description = description.concat(":trident: **Kitsune God Tier**\n");
        }
        else if (tailCount > 0) {
            description = description.concat(`:sewing_needle: Kitsune's Tail (${tailCount}x)\n`);
        }
        let userEffects = user.equips?.activeEffects ?? [];
        while (userEffects.length > 0) {
            let oldLength = userEffects.length;
            const effect = effectData[userEffects[0]];
            userEffects = userEffects.filter(i => i !== userEffects[0]);
            description = description.concat(`${effect.emoji} ${effect.name} ${effect.isStackable ? `(${oldLength - userEffects.length}x)` : ""}\n`);
        }
    }

    return description;
}

function getEquipEmbed(user) {
    return new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle("Your Equips -")
        .setDescription(getEmbedDescription(user));
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("equips")
		.setDescription("View what you have equipped"),
	async execute(user) {
        return {embeds: [getEquipEmbed(user)]};
    }
};

