module.exports = {
    emoji: ":balloon:",
    name: "Lost Balloon",
    value: "balloon",
    description: "JUNK! Might as well use it to free up a slot",
    rarity: -3.5,
    weight: 2,
    async onUse(user, getItemScreen) {
        return getItemScreen(user);
    }
}
