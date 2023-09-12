module.exports = {
    emoji: ":moon_cake:",
    name: "Kitsune's Greed",
    value: "greed",
    description: "Greatly boosts item quality and quantity temporarily",
    rarity: 8,
    weight: 2,
    activeEffects: ["greed"],
    async onUse(user, getItemChance) {
        return getItemChance(user, "You now have greatly increased item-finding stats :moon_cake:");
    }
}
