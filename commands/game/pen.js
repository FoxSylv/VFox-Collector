const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { shopData } = require('../../data/shopData.js');
const { foxEmoji } = require('../../data/foxEmoji.js');
const { countFoxes } = require('../../utilities/countFoxes.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName("pen")
		.setDescription("Look inside your fox pen!"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);

        let description = (countFoxes(user.foxes) === 0 && (user.coins ?? 0) === 0) ? "You have no foxes :(\n" : foxEmoji.reduce((acc, type) => {
            if ((user.foxes[type.value] ?? 0) !== 0) {
                return acc.concat(`**${user.foxes[type.value]}** ${type.emoji}\n`);
            }
            return acc;
        }, "");
        if ((user.coins ?? 0) !== 0) {
            description = description.concat(`**${user.coins}** :coin:\n`);
        }

        const pen = shopData.find(c => c.value === "pens").upgrades.find(u => u.value === user.equips?.pens);
        const embed = new EmbedBuilder()
            .setColor(0xEA580C)
            .setTitle(user.equips?.pens ? `${pen.name} -` : "Your Pen - ")
            .setDescription(description);
        await interaction.reply({embeds: [embed]});
    }
};

