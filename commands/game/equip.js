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
    if (user.equips?.activeEffects === undefined || user.equips?.activeEffects?.length === 0) {
        description = description.concat("You have no active effects!");
    }
    else {
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
		.setName("equip")
		.setDescription("Equip an upgrade, or view what you have equipped")
        .addStringOption(option =>
            option.setName("upgrade")
                  .setDescription("The upgrade to equip")
                  .addChoices(...shopData.filter(c => c.value !== "items").flatMap(c => c.upgrades.map(p => JSON.parse(`{"name": "${p.name}", "value": "${c.value + '.' + p.value}"}`))).concat([{name: "No Bait", value: "bait.none"}]))
        ),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const option = interaction.options.getString("upgrade");
        if (option) {
            if (option === "bait.none") {
                await interaction.reply("You are no longer equipping any bait!");
                if (user.equips) {
                    user.equips.bait = undefined;
                    await user.save();
                }
                return;
            }
            const [categoryVal, upgradeVal] = option.split('.');
            const upgradeName = shopData.find(c => c.value === categoryVal).upgrades.find(p => p.value === upgradeVal).name;

            if ((user.upgrades?.coin?.[categoryVal]?.[upgradeVal] ?? 0) === 0) {
                await interaction.reply(`You do not own ${categoryVal === "bait" ? "any" : "the"} ${upgradeName}!`);
                return;
            }
            user.equips ??= {};
            user.equips[categoryVal] = upgradeVal;
            await interaction.reply(`You have equipped ${categoryVal === "bait" ? "" : "the "}${upgradeName}!`);
            await user.save();
            return;
    	}
    
        await interaction.reply({embeds: [getEquipEmbed(user)]});
    }
};

