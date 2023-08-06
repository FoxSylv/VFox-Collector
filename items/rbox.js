module.exports = {
    emoji: ":wolf:",
    name: "Rare-Fox-In-A-Box",
    value: "rbox",
    description: "A rare fox in a box",
    rarity: 2,
    async onUse(user) {
        user.foxes ??= {};
        user.foxes.grey = (user.foxes.grey ?? 0) + 1;
        return "You got **1** :wolf:!";
    }
}
