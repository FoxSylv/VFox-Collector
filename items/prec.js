module.exports = {
    emoji: ":chopsticks:",
    name: "Kitsune's Precision",
    value: "prec",
    description: "Boosts item quality temporarily",
    rarity: 5,
    activeEffects: ["prec"],
    async onUse(user) {
        return "You feel lucky!";
    }
}
