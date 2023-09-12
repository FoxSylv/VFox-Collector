module.exports = {
    emoji: ":performing_arts:",
    name: "Fake Bait",
    value: "mbait",
    description: "Greatly reduces the chance to use bait temporarily",
    rarity: 6,
    weight: 3,
    activeEffects: ["mbait"],
    async onUse(user, getItemScreen) {
        return getItemScreen(user, "You now have a greatly reduced chance to use bait :performing_arts:");
    }
}
