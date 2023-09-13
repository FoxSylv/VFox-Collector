const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { getColor } = require('../../utilities/getColor.js');


const baits = shopData.find(c => c.value === "bait").upgrades;

function getBaitScreen(user) {
    let description = baits.reduce((acc, b) => {
        if ((user.upgrades?.coin?.bait?.[b.value] ?? 0) !== 0) {
            return acc.concat(`${b.emoji} **${user.upgrades.coin.bait[b.value]}**${user.equips?.bait === b.value ? " (equipped)": ""}\n`);
        }
        return acc;
    }, "");
    if (description === "") {
        description = "You have no bait :(";
    }
    const baitEmbed = new EmbedBuilder()
        .setColor(getColor(user))
        .setTitle("Your Bait - ")
        .setDescription(description);

    const baitButtons = [new ButtonBuilder({custom_id: "bait.none", style: ButtonStyle.Secondary, label: "No Bait", disabled: user.equips?.bait === undefined})]
        .concat(baits.map(b => {
            if ((user.upgrades?.coin?.bait?.[b.value] ?? 0) === 0) {
                return undefined;
            }
            return new ButtonBuilder({custom_id: `bait.${b.value}`, style: ButtonStyle.Primary, label: b.name.split(' ')[0], emoji: b.emoji, disabled: user.equips?.bait === b.value});
        }).filter(u => u));
    const row = new ActionRowBuilder().addComponents(...baitButtons);

    return {embeds: [baitEmbed], components: [row]};
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("bait")
		.setDescription("View and equip your bait!"),
    async buttonPress(user, customId) {
        const baitType = customId.split('.')[1];

        user.equips ??= {};
        if (baitType === "none") {
            user.equips.bait = undefined;
        }
        else {
            const bait = baits.find(b => b.value === baitType);
            user.equips.bait = bait.value;
        }

        await user.save();
        return getBaitScreen(user);
    },
	async execute(user) {
        return getBaitScreen(user);
	}
};

