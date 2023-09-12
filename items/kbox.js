module.exports = {
    emoji: ":shinto_shrine:",
    name: "Kitsune-In-A-Box",
    value: "kbox",
    description: "A kitsune in a box",
    rarity: 4,
    weight: 4,
    async onUse(user, getItemScreen) {
        user.foxes ??= {};
        user.foxes.kitsune = (user.foxes.kitsune ?? 0) + 1;
        return getItemScreen(user, "You got **1** :shinto_shrine:!");
    }
}
