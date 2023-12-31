module.exports = {
    emoji: ":gift:",
    name: "Kitsune Party Box",
    value: "pbox",
    description: "A bunch of kitsunes",
    rarity: 7,
    weight: 5,
    async onUse(user, getItemScreen) {
        const num = 1 + Math.floor(Math.random() * 3);
        user.foxes ??= {};
        user.foxes.kitsune = (user.foxes.kitsune ?? 0) + num;
        return getItemScreen(user, `You got **${num}** :shinto_shrine:!`);
    }
}
