module.exports = {
    emoji: ":fox:",
    name: "Fox-In-A-Box",
    value: "fbox",
    description: "A fox in a box",
    rarity: 0,
    async onUse(user) {
        user.foxes ??= {};
        user.foxes.orange = (user.foxes.orange ?? 0) + 1;
        return "You got **1** :fox:!";
    }
}
