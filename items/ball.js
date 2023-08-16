module.exports = {
    emoji: ":mirror_ball:",
    name: "Glitter Ball",
    value: "ball",
    description: "Temporarily boosts fox quality at the expense of fox and item quantity",
    rarity: 3,
    activeEffects: ["ball"],
    async onUse(user) {
        return "It's so pretty!";
    }
}
