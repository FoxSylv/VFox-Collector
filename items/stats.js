module.exports = {
    emoji: ":abacus:",
    name: "Stats Improver",
    value: "stats",
    description: "Unlocks the detailed stat screen",
    rarity: -1000,
    activeEffects: ["stats"],
    async onUse(user, getItemScreen) {
        return getItemScreen(user, "You now have access to the detailed stat screen!");
    }
}
