module.exports = {
    emoji: ":bucket:",
    name: "Useless Bucket",
    value: "can",
    description: "JUNK! Some cultures find this item distasteful",
    rarity: -5,
    async onUse(user) {
        return "Good riddance!";
    }
}