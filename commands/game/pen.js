const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');
const { foxEmoji } = require('../../data/foxEmoji.js');
const { countFoxes } = require('../../utilities/countFoxes.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName("pen")
		.setDescription("Look inside your fox pen!"),
	async execute(interaction) {
        const user = await getProfile(interaction.user.id);

        let description = countFoxes(user.foxes) === 0 ? "You have no foxes :(\n" : foxEmoji.reduce((acc, type) => {
            if ((user.foxes[type.value] ?? 0) !== 0) {
                return acc.concat(`**${user.foxes[type.value]}** ${type.emoji}\n`);
            }
            return acc;
        }, "");
        if ((user.coins ?? 0) !== 0) {
            description = description.concat(`${user.coins}:coin:\n`);
        }

        const embed = new EmbedBuilder()
            .setColor(0xEA580C)
            .setTitle(user.equips?.pen ? `${user.equips.pen} -` : "Your Pen - ")
            .setDescription(description);
        await interaction.reply({embeds: [embed]});
    }
};

