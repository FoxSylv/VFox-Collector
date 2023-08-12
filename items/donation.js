module.exports = {
    emoji: ":dvd:",
    name: "Shrine Donation",
    value: "donation",
    description: "Preserves shrine upgrades next time you sell foxes",
    rarity: -1000,
    activeEffects: ["donation"],
    async onUse(user) {
        return "You now have the kitsunes' graces";
    }
}
