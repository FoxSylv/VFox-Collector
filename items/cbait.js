module.exports = {
    emoji: ":boomerang:",
    name: "Bait Boomerang",
    value: "cbait",
    description: "Temporarily reduces the chance to use bait",
    rarity: 2,
    weight: 3,
    activeEffects: ["cbait"],
    async onUse(user) {
        return "You now have a reduced chance to use bait";
    }
}
