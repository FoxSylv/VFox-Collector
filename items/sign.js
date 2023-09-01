module.exports = {
    emoji: ":name_badge:",
    name: "Chipped Sign",
    value: "sign",
    description: "JUNK! Might as well use it to free up a slot",
    rarity: -4.5,
    weight: 2,
    async onUse(user) {
        return "Good riddance!";
    }
}
