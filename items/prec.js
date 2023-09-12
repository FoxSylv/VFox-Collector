module.exports = {
    emoji: ":chopsticks:",
    name: "Kitsune's Precision",
    value: "prec",
    description: "Boosts item quality temporarily",
    rarity: 5,
    weight: 1,
    activeEffects: ["prec"],
    async onUse(user, getItemScreen) {
        return getItemScreen(user, "You now have increased item quality :chopsticks:");
    }
}
