module.exports = {
    emoji: ":chopsticks:",
    name: "Kitsune's Precision",
    value: "prec",
    description: "Boosts item quality",
    rarity: 5,
    activeEffects: ["iqualu"],
    async onUse(user) {
        return "You feel lucky";
    }
}
