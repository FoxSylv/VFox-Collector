module.exports = {
    emoji: ":moon_cake:",
    name: "Kitsune's Greed",
    value: "greed",
    description: "Greatly boosts item quality and quantity temporarily",
    rarity: 8,
    activeEffects: ["greed"],
    async onUse(user) {
        return "You're sure to find what you're looking for now!";
    }
}
