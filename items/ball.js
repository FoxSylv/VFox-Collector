module.exports = {
    emoji: ":mirror_ball:",
    name: "Glitter Ball",
    value: "ball",
    description: "Temporarily boosts fox quality at the expense of fox and item quantity",
    rarity: 3,
    weight: 2,
    activeEffects: ["ball"],
    async onUse(user, getItemScreen) {
        return getItemScreen(user, "You now have increased fox quality :mirror_ball:");
    }
}
