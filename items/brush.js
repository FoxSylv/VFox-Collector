const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    emoji: ":paintbrush:",
    name: "Paintbrush",
    value: "brush",
    description: "Colors embeds to a custom color",
    rarity: 0.5,
    weight: 1,
    async modalSubmit(user, getItemScreen, items, fields) {
        const raw = fields.get("color").value.toLowerCase();
        let message = "";
        if (raw === "") {
            message = "Your embed colors did not change";
        }
        else {
            try {
                user.color = parseInt(raw, 16);
                await user.save();
                message = `Your embeds are now \`0x${raw}\``;
            }
            catch (e) {
                message = "The paintbrush broke... Your embed colors remain unchanged";
            }
        }
        return getItemScreen(user, message);
    },
    async onUse(user, interaction) {
        user.equips ??= {};
        user.equips.activeEffects ??= [];
        if (!user.equips.activeEffects.includes("color")) {
            user.equips.activeEffects = user.equips.activeEffects.concat("color");
        }

        const modal = new ModalBuilder()
            .setCustomId("items.brush.color")
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
        return {modal: modal};
    }
}
