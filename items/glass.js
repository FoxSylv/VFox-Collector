module.exports = {
    emoji: ":mag_right:",
    name: "Magnifying Glass",
    value: "glass",
    description: "Increased item quantity until an item is found",
    rarity: 1.5,
    activeEffects: ["iquanu"],
    async onUse(user) {
        return "You now have increased item quantity";
    }
}