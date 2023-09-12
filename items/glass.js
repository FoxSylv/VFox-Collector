module.exports = {
    emoji: ":mag_right:",
    name: "Magnifying Glass",
    value: "glass",
    description: "Temporarily boosts item quantity until an item is found",
    rarity: 1,
    weight: 2,
    activeEffects: ["glass"],
    async onUse(user, getItemScreen) {
        return getItemScreen(user, "You now have increased item quantity :mag_right:");
    }
}
