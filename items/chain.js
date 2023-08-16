module.exports = {
    emoji: ":chains:",
    name: "Snare",
    value: "chain",
    description: "Temporarily boosts fox quantity at the expense of fox and item quality",
    rarity: 2.5,
    activeEffects: ["chain"],
    async onUse(user) {
        return "You have laid your trap";
    }
}
