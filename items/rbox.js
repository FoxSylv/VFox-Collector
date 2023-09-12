module.exports = {
    emoji: ":wolf:",
    name: "Rare-Fox-In-A-Box",
    value: "rbox",
    description: "A rare fox in a box",
    rarity: 2,
    weight: 4,
    async onUse(user, getItemScreen) {
        user.foxes ??= {};
        user.foxes.grey = (user.foxes.grey ?? 0) + 1;
        return getItemScreen(user, "You got **1** :wolf:!");
    }
}
