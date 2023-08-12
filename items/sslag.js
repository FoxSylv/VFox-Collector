module.exports = {
    emoji: ":mag:",
    name: "Magnifying Glass",
    value: "sslag",
    description: "Decreased item quantity until an item is found",
    rarity: 1.5,
    activeEffects: ["iquand"],
    async onUse(user) {
        return "Oops it was the wrong way around! You now have decreased item quantity";
    }
}
