module.exports = {
    emoji: ":sewing_needle:",
    name: "Kitsune's Tail",
    value: "tail",
    description: "A blessing bestowed upon you from the fluffy deities",
    rarity: -1000,
    async onUse(user, getItemScreen) {
        return getItemScreen(user, "What a fluffy tail!");
    }
}
