module.exports = {
    emoji: ":triangular_flag_on_post:",
    name: "Kitsune's Faith",
    value: "faith",
    description: "Boosts fox-finding chance",
    rarity: 9,
    activeEffects: ["chance"],
    async onUse(user) {
        return "You're in the endgame now";
    }
}
