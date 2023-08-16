module.exports = {
    emoji: ":microscope:",
    name: "Research",
    value: "micro",
    description: "Temporarily boosts item quality at massive detriment to everything else",
    rarity: 3,
    activeEffects: ["micro"],
    async onUse(user) {
        return "Lab coat and safety glasses not included";
    }
}
