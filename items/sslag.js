module.exports = {
    emoji: ":mag:",
    name: "Magnifying Glass",
    value: "sslag",
    description: "Temporarily decreases item quantity until an item is found",
    rarity: 1,
    weight: 2,
    activeEffects: ["sslag"],
    async onUse(user, getItemScreen) {
        return getItemScreen(user, "Oops it was the wrong way around! You now have decreased item quantity :mag:");
    }
}
