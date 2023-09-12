module.exports = {
    emoji: ":microscope:",
    name: "Research",
    value: "micro",
    description: "Temporarily boosts item quality at massive detriment to everything else",
    rarity: 3,
    weight: 2,
    activeEffects: ["micro"],
    async onUse(user, getItemScreen) {
        return getItemScreen(user, "You now have increased item quality :microscope:");
    }
}
