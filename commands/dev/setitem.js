const { SlashCommandBuilder } = require('discord.js');
const { getProfile } = require('../../utilities/db.js');

module.exports = {
    isDev: true,
	data: new SlashCommandBuilder()
		.setName("setitem")
		.setDescription("Magically apparate items")
        .addStringOption(option =>
            option.setName("item")
                  .setDescription("Value of item to apparate")
                  .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("slot")
                  .setDescription("Slot to put the item in")
                  .setMinValue(1)
                  .setMaxValue(9)
        ),
	async execute(user, options) {
        let userItems = user.items ?? {};
        const newItem = options.getString("item");
        let slot = options.getInteger("slot") ?? (userItems.findIndex(i => !i) + 1);
        if (slot === 0) { //if (findIndex fails)
            slot = userItems.length + 1;
        }

        if (slot > 9) {
            return {content: "Item inventory full!"};
        }
        userItems[slot - 1] = newItem;
        user.items = userItems;
        await user.save();
        return {content: `You now have ${newItem} in slot ${slot}`};
	}
};

