module.exports = {
    emoji: ":fox:",
    name: "Fox-In-A-Box",
    value: "fbox",
    description: "A fox in a box",
    rarity: 0,
    weight: 4,
    async onUse(user, getItemScreen) {
        user.foxes ??= {};
        user.foxes.orange = (user.foxes.orange ?? 0) + 1;
        return getItemScreen(user, "You got **1** :fox:!");
    }
}
