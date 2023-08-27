const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    emoji: ":paintbrush:",
    name: "Paintbrush",
    value: "brush",
    description: "Colors embeds to a custom color",
    rarity: 0.5,
    async onUse(user, interaction) {
        user.equips ??= {};
        user.equips.activeEffects ??= [];
        if (!user.equips.activeEffects.includes("color")) {
            user.equips.activeEffects = user.equips.activeEffects.concat("color");
        }

        const modal = new ModalBuilder()
            .setCustomId("paintbrush")
            .setTitle("Choose your color!")
            .addComponents(new ActionRowBuilder()
                .addComponents(
                    new TextInputBuilder()
                        .setCustomId("color")
                        .setLabel("Input your new embed color's hex code:")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("Leave blank for no change")
                        .setMaxLength(6)
                        .setRequired(false)
                )
            );

        await interaction.showModal(modal);
        const response = await interaction.awaitModalSubmit({filter: i => i.user.id === interaction.user.id, time: 240_000})
            .then(i => i.deferUpdate());
        try {
            let raw = response.interaction.fields.fields.get("color").value.toLowerCase();
            if (raw === "") {
                return "Your embed colors did not change"
            }
            user.color = parseInt(raw, 16);
            return `Your embeds are now \`0x${raw}\`!`;
        }
        catch (e) {
            console.error(e);
            return "Your paintbrush breaks";
        }
    }
}
