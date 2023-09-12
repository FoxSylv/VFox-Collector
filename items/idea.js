module.exports = {
    emoji: ":cd:",
    name: "Innovation",
    value: "idea",
    description: "Greatly boosts fox quality and quantity temporarily",
    rarity: 7.5,
    weight: 2,
    activeEffects: ["idea"],
    async onUse(user, getItemScreen) {
        return getItemScreen(user, "You now have greatly boosted fox quality and quantity :cd:");
    }
}
