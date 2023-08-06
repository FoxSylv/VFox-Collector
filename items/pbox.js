module.exports = {
    emoji: ":gift:",
    name: "Kitsune Party Box",
    value: "pbox",
    description: "A bunch of kitsunes",
    rarity: 7,
    async onUse(user) {
        const num = 1 + Math.floor(Math.random() * 3);
        user.foxes ??= {};
        user.foxes.kitsune = (user.foxes.kitsune ?? 0) + num;
        return `You got **${num}** :shinto_shrine:!`;
    }
}
