module.exports = {
    emoji: ":clock3:",
    name: "Broken Clock",
    value: "clock",
    description: "JUNK! Might as well use it to free up a slot",
    rarity: -4,
    weight: 3,
    async onUse(user) {
        return "Good riddance!";
    }
}
