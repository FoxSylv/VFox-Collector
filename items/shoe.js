module.exports = {
    emoji: ":athletic_shoe:",
    name: "Old Shoe",
    value: "shoe",
    description: "JUNK! Might as well use it to free up a slot",
    rarity: -2,
    weight: 2,
    async onUse(user, getItemScreen) {
        return getItemScreen(user);
    }
}
