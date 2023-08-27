const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { getColor } = require('../../utilities/getColor.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName("bait")
		.setDescription("View and equip your bait!"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);
        const baits = shopData.find(c => c.value === "bait").upgrades;

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

        const baitButtons = [new ButtonBuilder({custom_id: "nobait", style: ButtonStyle.Secondary, label: "No Bait", disabled: user.equips?.bait === undefined})].concat(baits.map(b => {
            if ((user.upgrades?.coin?.bait?.[b.value] ?? 0) === 0) {
                return undefined;
            }
            return new ButtonBuilder({custom_id: b.value, style: ButtonStyle.Primary, label: b.name.split(' ')[0], emoji: b.emoji, disabled: user.equips?.bait === b.value});
        }).filter(u => u));
        const row = new ActionRowBuilder().addComponents(...baitButtons);

        const response = await interaction.reply({embeds: [baitEmbed], components: [row]});
        try {
            const confirmation = await response.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id, time: 60000 }); 
            user.equips ??= {};
            if (confirmation.customId === "nobait") {
                user.equips.bait = undefined;
                await confirmation.update({content: "You have unequipped your bait!", embeds: [], components: []});
            }
            else {
                const bait = baits.find(b => b.value === confirmation.customId);
                user.equips.bait = bait.value;
                await confirmation.update({content: `You have equipped ${bait.emoji} ${bait.name}!`, embeds: [], components: []});
            }

            await user.save();
        }
        catch (e) {
            await interaction.editReply({ components: [] }); 
        }
	}
};

