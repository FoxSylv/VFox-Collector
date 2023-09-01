module.exports = {
    emoji: ":rolled_up_newspaper:",
    name: "Dated Newspaper",
    value: "newspaper",
    description: "JUNK! Might as well use it to free up a slot",
    rarity: -2.5,
    weight: 1,
    async onUse(user) {
        return "Good riddance!";
    }
}
