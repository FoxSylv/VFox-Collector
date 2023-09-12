module.exports = {
    emoji: ":archery:",
    name: "Kitsune's Faith",
    value: "faith",
    description: "Boosts fox-finding chance",
    rarity: 9,
    weight: 1,
    activeEffects: ["chance"],
    async onUse(user, getItemChance) {
        return getItemChance(user, "You now have increased fox-finding chance :archery:");
    }
}
