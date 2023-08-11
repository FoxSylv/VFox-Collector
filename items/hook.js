module.exports = {
    emoji: ":hook:",
    name: "Fishing Hook",
    value: "shoe",
    description: "JUNK! Might as well use it to free up a slot",
    rarity: -3,
    async onUse(user) {
        return "Good riddance!";
    }
}
