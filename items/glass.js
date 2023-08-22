module.exports = {
    emoji: ":mag_right:",
    name: "Magnifying Glass",
    value: "glass",
    description: "Temporarily increases item quantity until an item is found",
    rarity: 1,
    activeEffects: ["glass"],
    async onUse(user) {
        return "You now have increased item quantity";
    }
}
