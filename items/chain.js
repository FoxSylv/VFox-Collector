module.exports = {
    emoji: ":chains:",
    name: "Snare",
    value: "chain",
    description: "Boosts fox quantity at the expense of fox and item quality",
    rarity: 2.5,
    activeEffects: ["fquanuu", "fquald", "iquald"],
    async onUse(user) {
        return "You have laid your trap";
    }
}
