module.exports = {
    emoji: ":mag:",
    name: "Magnifying Glass",
    value: "sslag",
    description: "Temporarily decreases item quantity until an item is found",
    rarity: 1,
    activeEffects: ["sslag"],
    async onUse(user) {
        return "Oops it was the wrong way around! You now have decreased item quantity";
    }
}
