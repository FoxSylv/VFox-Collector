module.exports = {
    emoji: ":performing_arts:",
    name: "Fake Bait",
    value: "mbait",
    description: "Temporarily decimates the chance to use bait",
    rarity: 6,
    weight: 3,
    activeEffects: ["mbait"],
    async onUse(user) {
        return "You now have a greatly reduced chance to use bait";
    }
}
