module.exports = {
    emoji: ":bucket:",
    name: "Useless Bucket",
    value: "bucket",
    description: "JUNK! Some cultures find this item distasteful",
    rarity: -5,
    weight: 1,
    async onUse(user, getItemScreen) {
        return getItemScreen(user, "Good riddance!");
    }
}
