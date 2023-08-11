//Paintbrush active effect helper
module.exports = {
    emoji: ":art:",
    name: "Custom Embed Color",
    value: "color",
    description: "Gives a custom embed color",
    rarity: -1000,
    activeEffect: {name: "Custom Color", value: "color", isStackable: false},
    async onUse(user) {
        return "This should never appear!";
    }
}
