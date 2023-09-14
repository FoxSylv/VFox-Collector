module.exports = {
    emoji: ":hook:",
    name: "Fishing Hook",
    value: "hook",
    description: "JUNK! Might as well use it to free up a slot",
    rarity: -3,
    weight: 5,
    async onUse(user, getItemScreen) {
        return getItemScreen(user);
    }
}
