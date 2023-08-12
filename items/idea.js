module.exports = {
    emoji: ":cd:",
    name: "Innovation",
    value: "idea",
    description: "Greatly boosts fox quality and quantity",
    rarity: 7.5,
    activeEffects: ["fqualuu", "fquanuu"],
    async onUse(user) {
        return "Ideas never die (until you get another item, at least)";
    }
}
