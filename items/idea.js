module.exports = {
    emoji: ":cd:",
    name: "Innovation",
    value: "idea",
    description: "Greatly boosts fox quality and quantity temporarily",
    rarity: 7.5,
    activeEffects: ["idea"],
    async onUse(user) {
        return "Ideas never die (until you get another item, at least)";
    }
}
