module.exports = {
    emoji: ":microscope:",
    name: "Research",
    value: "micro",
    description: "Boosts item quality at massive detriment to everything else",
    rarity: 3,
    activeEffects: ["iqualu", "iquandd", "fqualdd", "fquandd"],
    async onUse(user) {
        return "It's so pretty!";
    }
}
