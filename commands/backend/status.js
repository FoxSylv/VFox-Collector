const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const packageJson = require('../../package.json');
const { getColor } = require('../../utilities/getColor.js');
const { secToTime } = require('../../utilities/secToTime.js');
const { getServerCount } = require('../../utilities/getServerCount.js');


function getStatusEmbed(user) {
    const serverCount = getServerCount();
    return new EmbedBuilder()
        .setColor(getColor(user))
        .addFields(
            {name: "Author", value: "**[FoxSylv](https://foxsylv.dev)**", inline: true},
            {name: "Version", value: packageJson.version, inline: true},
            {name: "Uptime", value: `${secToTime(process.uptime())}`, inline: true}
        )
        .setTimestamp()
        .setFooter({text: `Currently in ${serverCount} server${serverCount === 1 ? "" : "s"}!`})
}

function getStatusButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel("Invite VFox")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.com/api/oauth2/authorize?client_id=1003467309911900270&permissions=0&scope=bot"),
        new ButtonBuilder()
            .setLabel("Official Server")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.com/invite/mmzed2k3cw"),
        new ButtonBuilder()
            .setLabel("Source Code")
            .setStyle(ButtonStyle.Link)
            .setURL("https://github.com/FoxSylv/VFox-Collector")
    );
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("botstatus")
		.setDescription("Retrieves info about VFox Bot"),
	async execute(user) {
		return {embeds: [getStatusEmbed(user)], components: [getStatusButtons()]};
	}
};

