module.exports = {
    emoji: ":mirror_ball:",
    name: "Glitter Ball",
    value: "ball",
    description: "Boosts fox quality at the expense of fox and item quantity",
    rarity: 3,
    activeEffects: ["fqualuu", "iquand", "fquand"],
    async onUse(user) {
        return "It's so pretty!";
    }
}